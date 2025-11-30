import { prisma } from '../lib/prisma';
import { PasswordHashing } from "../passwordhashing";

export class AuthUserService {

    static async login(correo: string, password: string) {
        try {
            const usuario = await prisma.usuario.findUnique({
                where: { CorreoElectronico: correo },
                include: {
                    contrasenias: {
                        where: { Activa: true },
                        orderBy: { FechaCambio: "desc" },
                        take: 1
                    },
                    rol: true
                }
            });

            if (!usuario) {
                return { 
                    success: false, 
                    message: "Credenciales incorrectas" 
                };
            }

            if (usuario.EstadoCuenta !== "activo") {
                return { 
                    success: false, 
                    message: "Cuenta no activa. Contacta al administrador." 
                };
            }

            const passData = usuario.contrasenias[0];

            if (!passData) {
                return { 
                    success: false, 
                    message: "Error en las credenciales" 
                };
            }

            const valid = await PasswordHashing.verify(
                password,
                passData.ContrasenaHash,
                passData.Salt
            );

            if (!valid) {
                return { 
                    success: false, 
                    message: "Credenciales incorrectas" 
                };
            }

            return {
                success: true,
                userId: usuario.IDUsuario,
                userRole: usuario.IDRol,
                userName: usuario.Nombre,
                roleName: usuario.rol?.NombreRol
            };
        } catch (error) {
            console.error("Error en login:", error);
            return {
                success: false,
                message: "Error al iniciar sesión"
            };
        }
    }

    static async register(
        nombre: string,
        correo: string,
        password: string,
        rol: string,
        fechaNacimiento?: Date,
        institucionEducativa?: string
    ) {
        try {
            // Verificar si el usuario ya existe
            const existingUser = await prisma.usuario.findUnique({
                where: { CorreoElectronico: correo }
            });

            if (existingUser) {
                return { 
                    success: false, 
                    message: "El correo electrónico ya está registrado" 
                };
            }

            // Mapear los roles del frontend a los roles existentes
            let rolNombre: string;
            switch(rol) {
                case 'postulante':
                case 'tutor':
                case 'organismo':
                    rolNombre = "Usuario";
                    break;
                default:
                    return { 
                        success: false, 
                        message: "Rol no válido" 
                    };
            }

            const rolRecord = await prisma.rol.findFirst({
                where: { 
                    NombreRol: rolNombre
                }
            });

            if (!rolRecord) {
               return { 
                    success: false, 
                    message: "Rol no válido" 
                };
            }

            const IDRol = rolRecord.IDRol;

            // Hashear la contraseña
            const salt = PasswordHashing.genSalt();
            const hashedPassword = await PasswordHashing.hashPassword(password, salt);

            // Crear transacción para crear usuario y perfil específico
            const result = await prisma.$transaction(async (tx) => {
                // Crear usuario
                const newUser = await tx.usuario.create({
                    data: {
                        Nombre: nombre,
                        CorreoElectronico: correo,
                        IDRol: IDRol,
                        EstadoCuenta: 'activo',
                        FechaRegistro: new Date(),
                    }
                });

                // Crear contraseña
                await tx.contrasenias.create({
                    data: {
                        IDUsuario: newUser.IDUsuario,
                        ContrasenaHash: hashedPassword,
                        Salt: salt,
                        Activa: true,
                        FechaCambio: new Date(),
                    }
                });

                // Crear perfil específico según el rol
                if (rol === 'postulante') {
                    await tx.voluntario.create({
                        data: {
                            IDUsuario: newUser.IDUsuario,
                            Nombre: nombre,
                            FechaNacimiento: fechaNacimiento || new Date('2000-01-01'),
                            InstitucionEducativa: institucionEducativa || "Institución por defecto",
                            HorasAcumuladas: 0,
                        }
                    });
                } else if (rol === 'tutor') {
                    await tx.tutor.create({
                        data: {
                            IDUsuario: newUser.IDUsuario,
                            Nombre: nombre,
                            FechaNacimiento: fechaNacimiento || new Date('1980-01-01'),
                        }
                    });
                }
                // Para organización, solo creamos el usuario por ahora

                return newUser;
            });

            return {
                success: true,
                userId: result.IDUsuario,
                userRole: result.IDRol,
                message: "Usuario registrado exitosamente"
            };

        } catch (error) {
            console.error("Error en registro:", error);
            return {
                success: false,
                message: "Error al registrar el usuario"
            };
        }
    }

    static async getUserProfile(userId: number) {
        try {
            const usuario = await prisma.usuario.findUnique({
                where: { IDUsuario: userId },
                include: {
                    rol: true,
                    voluntario: true,
                    tutor: true,
                    organizaciones: true
                }
            });

            return usuario;
        } catch (error) {
            console.error("Error al obtener perfil:", error);
            return null;
        }
    }
}
