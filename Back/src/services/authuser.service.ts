import prisma from "../lib/prisma";
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

            console.log("DEBUG LOGIN:", {
                usuario: usuario.Nombre,
                rolId: usuario.IDRol,
                rolNombre: usuario.rol?.NombreRol
            });

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
        const existingUser = await prisma.usuario.findUnique({
            where: { CorreoElectronico: correo }
        });

        if (existingUser) {
            return { 
                success: false, 
                message: "El correo electrónico ya está registrado" 
            };
        }

        let rolNombre: string;
        switch(rol) {
            case 'postulante':
                rolNombre = "Voluntario"; 
                break;
            case 'tutor':
                rolNombre = "Tutor";       
                break;
            case 'organismo':
                rolNombre = "Organización"; 
                break;
            default:
                return { 
                    success: false, 
                    message: "Rol no válido" 
                };
        }

        console.log(`Buscando rol: ${rolNombre} para rol recibido: ${rol}`);

        const rolRecord = await prisma.rol.findFirst({
            where: { 
                NombreRol: rolNombre
            }
        });

        console.log(`Rol encontrado:`, rolRecord);

        if (!rolRecord) {
            const availableRoles = await prisma.rol.findMany({
                select: { NombreRol: true }
            });
            
            return { 
                success: false, 
                message: `Rol '${rolNombre}' no encontrado. Roles disponibles: ${availableRoles.map(r => r.NombreRol).join(', ')}` 
            };
        }

        const IDRol = rolRecord.IDRol;

        const salt = PasswordHashing.genSalt();
        const hashedPassword = await PasswordHashing.hashPassword(password, salt);

        const result = await prisma.$transaction(async (tx) => {
            const newUser = await tx.usuario.create({
                data: {
                    Nombre: nombre,
                    CorreoElectronico: correo,
                    IDRol: IDRol,
                    EstadoCuenta: 'activo',
                    FechaRegistro: new Date(),
                }
            });

            await tx.contrasenias.create({
                data: {
                    IDUsuario: newUser.IDUsuario,
                    ContrasenaHash: hashedPassword,
                    Salt: salt,
                    Activa: true,
                    FechaCambio: new Date(),
                }
            });

            if (rol === 'postulante') {
                await tx.voluntario.create({
                    data: {
                        IDUsuario: newUser.IDUsuario,
                        Nombre: nombre,
                        FechaNacimiento: fechaNacimiento || new Date('2000-01-01'),
                        InstitucionEducativa: institucionEducativa || "Institución por defecto",
                        HorasAcumuladas: 0,
                        TipoDiscapacidad: "ninguna",
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
            } else if (rol === 'organismo') {
                await tx.organizacion.create({
                    data: {
                        IDUsuario: newUser.IDUsuario,
                        NombreOrganizacion: nombre,
                        Estado: "pendiente",
                    }
                });
            }

            console.log(`Usuario creado: ${nombre}, Rol ID: ${IDRol}, Rol Nombre: ${rolNombre}`);

            return newUser;
        });

        return {
            success: true,
            userId: result.IDUsuario,
            userRole: result.IDRol,
            message: "Usuario registrado exitosamente"
        };

    } catch (error: any) {
        console.error("Error en registro:", error);
        return {
            success: false,
            message: error.message || "Error al registrar el usuario"
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
