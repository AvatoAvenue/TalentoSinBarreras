import { prisma } from '../lib/prisma';

export interface UpdateUserProfileData {
    nombre?: string;
    telefono?: string;
    biografia?: string;
}

export interface UpdateVoluntarioData {
    nombre?: string;
    fechaNacimiento?: Date;
    institucionEducativa?: string;
    tipoDiscapacidad?: string;
    adaptacionesRequeridas?: string;
    habilidades?: string;
}

export interface UpdateTutorData {
    nombre?: string;
    fechaNacimiento?: Date;
    parentesco?: string;
    telefono?: string;
    direccionCompleta?: string;
}

export interface UpdateOrganizacionData {
    nombreOrganizacion?: string;
    tipoOrganizacion?: string;
    categoriaPrincipal?: string;
    responsable?: string;
    telefono?: string;
    descripcion?: string;
    sitioWeb?: string;
}

export class ProfileService {
    // Obtener perfil completo
    static async getProfile(userId: number) {
        try {
            const usuario = await prisma.usuario.findUnique({
                where: { IDUsuario: userId },
                include: {
                    rol: true,
                    voluntario: {
                        include: {
                            tutor: true,
                            registrosParticipacion: {
                                include: {
                                    campania: {
                                        include: {
                                            organizacion: true
                                        }
                                    }
                                },
                                orderBy: {
                                    FechaParticipacion: 'desc'
                                }
                            }
                        }
                    },
                    tutor: {
                        include: {
                            voluntariosTutorados: true
                        }
                    },
                    organizaciones: {
                        include: {
                            ubicacion: true,
                            campanias: {
                                orderBy: {
                                    FechaInicio: 'desc'
                                }
                            }
                        }
                    }
                }
            });

            if (!usuario) {
                return { success: false, message: "Usuario no encontrado" };
            }

            return {
                success: true,
                data: usuario
            };
        } catch (error) {
            console.error("Error al obtener perfil:", error);
            return {
                success: false,
                message: "Error al obtener el perfil"
            };
        }
    }

    // Actualizar información básica de usuario
    static async updateUserProfile(userId: number, data: UpdateUserProfileData) {
        try {
            const usuario = await prisma.usuario.update({
                where: { IDUsuario: userId },
                data: {
                    Nombre: data.nombre,
                    Telefono: data.telefono,
                    Biografia: data.biografia
                }
            });

            return {
                success: true,
                message: "Perfil actualizado exitosamente",
                data: usuario
            };
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            return {
                success: false,
                message: "Error al actualizar el perfil"
            };
        }
    }

    // Actualizar perfil de voluntario
    static async updateVoluntarioProfile(userId: number, data: UpdateVoluntarioData) {
        try {
            // Primero verificamos si existe el voluntario
            const voluntario = await prisma.voluntario.findUnique({
                where: { IDUsuario: userId }
            });

            if (!voluntario) {
                return {
                    success: false,
                    message: "Perfil de voluntario no encontrado"
                };
            }

            const updated = await prisma.voluntario.update({
                where: { IDUsuario: userId },
                data: {
                    Nombre: data.nombre,
                    FechaNacimiento: data.fechaNacimiento,
                    InstitucionEducativa: data.institucionEducativa,
                    TipoDiscapacidad: data.tipoDiscapacidad as any,
                    AdaptacionesRequeridas: data.adaptacionesRequeridas,
                    Habilidades: data.habilidades
                }
            });

            return {
                success: true,
                message: "Perfil de voluntario actualizado",
                data: updated
            };
        } catch (error) {
            console.error("Error al actualizar voluntario:", error);
            return {
                success: false,
                message: "Error al actualizar el perfil del voluntario"
            };
        }
    }

    // Actualizar perfil de tutor
    static async updateTutorProfile(userId: number, data: UpdateTutorData) {
        try {
            const tutor = await prisma.tutor.findUnique({
                where: { IDUsuario: userId }
            });

            if (!tutor) {
                return {
                    success: false,
                    message: "Perfil de tutor no encontrado"
                };
            }

            const updated = await prisma.tutor.update({
                where: { IDUsuario: userId },
                data: {
                    Nombre: data.nombre,
                    FechaNacimiento: data.fechaNacimiento,
                    Parentesco: data.parentesco,
                    Telefono: data.telefono,
                    DireccionCompleta: data.direccionCompleta
                }
            });

            return {
                success: true,
                message: "Perfil de tutor actualizado",
                data: updated
            };
        } catch (error) {
            console.error("Error al actualizar tutor:", error);
            return {
                success: false,
                message: "Error al actualizar el perfil del tutor"
            };
        }
    }

    // Actualizar perfil de organización
    static async updateOrganizacionProfile(userId: number, data: UpdateOrganizacionData) {
        try {
            const organizacion = await prisma.organizacion.findFirst({
                where: { IDUsuario: userId }
            });

            if (!organizacion) {
                return {
                    success: false,
                    message: "Organización no encontrada"
                };
            }

            const updated = await prisma.organizacion.update({
                where: { IDOrganizacion: organizacion.IDOrganizacion },
                data: {
                    NombreOrganizacion: data.nombreOrganizacion,
                    TipoOrganizacion: data.tipoOrganizacion,
                    CategoriaPrincipal: data.categoriaPrincipal,
                    Responsable: data.responsable,
                    Telefono: data.telefono,
                    Descripcion: data.descripcion,
                    SitioWeb: data.sitioWeb
                }
            });

            return {
                success: true,
                message: "Perfil de organización actualizado",
                data: updated
            };
        } catch (error) {
            console.error("Error al actualizar organización:", error);
            return {
                success: false,
                message: "Error al actualizar el perfil de la organización"
            };
        }
    }

    // Para tutores: Actualizar el perfil del voluntario que tutorean
    static async updateVoluntarioByTutor(tutorUserId: number, voluntarioId: number, data: UpdateVoluntarioData) {
        try {
            // Verificar que el tutor es realmente el tutor de este voluntario
            const tutor = await prisma.tutor.findUnique({
                where: { IDUsuario: tutorUserId },
                include: {
                    voluntariosTutorados: {
                        where: { IDVoluntario: voluntarioId }
                    }
                }
            });

            if (!tutor || tutor.voluntariosTutorados.length === 0) {
                return {
                    success: false,
                    message: "No tienes permisos para editar este voluntario"
                };
            }

            const updated = await prisma.voluntario.update({
                where: { IDVoluntario: voluntarioId },
                data: {
                    Nombre: data.nombre,
                    FechaNacimiento: data.fechaNacimiento,
                    InstitucionEducativa: data.institucionEducativa,
                    TipoDiscapacidad: data.tipoDiscapacidad as any,
                    AdaptacionesRequeridas: data.adaptacionesRequeridas,
                    Habilidades: data.habilidades
                }
            });

            return {
                success: true,
                message: "Perfil del voluntario actualizado",
                data: updated
            };
        } catch (error) {
            console.error("Error al actualizar voluntario por tutor:", error);
            return {
                success: false,
                message: "Error al actualizar el perfil del voluntario"
            };
        }
    }
}
