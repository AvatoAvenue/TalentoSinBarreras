import { prisma } from '../lib/prisma';

export type TipoNotificacion = 
  | 'campania_actualizada'
  | 'campania_aprobada'
  | 'campania_rechazada'
  | 'nueva_postulacion'
  | 'postulacion_aceptada'
  | 'postulacion_rechazada'
  | 'certificado_emitido'
  | 'multa_asignada'
  | 'recordatorio'
  | 'sistema';

export interface NotificacionData {
  idUsuario: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  metadata?: Record<string, any>;
  idCampania?: number;
  idRegistro?: number;
  idCertificado?: number;
  idMulta?: number;
}

export class NotificationService {
  // Nueva notificación
  static async crear(data: NotificacionData) {
    try {
      const notificacion = await prisma.notificacion.create({
        data: {
          IDUsuario: data.idUsuario,
          Tipo: data.tipo,
          Titulo: data.titulo,
          Mensaje: data.mensaje,
          Metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          Estado: 'no_leida',
          IDCampania: data.idCampania,
          IDRegistro: data.idRegistro,
          IDCertificado: data.idCertificado,
          IDMulta: data.idMulta,
        },
        include: {
          usuario: {
            select: {
              IDUsuario: true,
              Nombre: true,
              CorreoElectronico: true,
            }
          },
          campania: {
            select: {
              IDCampania: true,
              Nombre: true,
            }
          }
        }
      });

      return {
        success: true,
        data: notificacion
      };
    } catch (error) {
      console.error('Error al crear notificación:', error);
      return {
        success: false,
        message: 'Error al crear la notificación'
      };
    }
  }

  static async obtenerPorUsuario(
    idUsuario: number,
    opciones?: {
      limite?: number;
      soloNoLeidas?: boolean;
      tipo?: TipoNotificacion;
    }
  ) {
    try {
      const { limite = 50, soloNoLeidas = false, tipo } = opciones || {};

      const where: any = {
        IDUsuario: idUsuario,
      };

      if (soloNoLeidas) {
        where.Estado = 'no_leida';
      } else {
        where.Estado = {
          in: ['no_leida', 'leida']
        };
      }

      if (tipo) {
        where.Tipo = tipo;
      }

      const notificaciones = await prisma.notificacion.findMany({
        where,
        take: limite,
        orderBy: {
          FechaCreacion: 'desc'
        },
        include: {
          campania: {
            select: {
              IDCampania: true,
              Nombre: true,
              Estado: true,
            }
          },
          registro: {
            select: {
              IDRegistro: true,
              HorasTrabajadas: true,
            }
          },
          certificado: {
            select: {
              IDCertificado: true,
              HorasTrabajadas: true,
              Estado: true,
            }
          },
          multa: {
            select: {
              IDMulta: true,
              Monto: true,
              Estado: true,
            }
          }
        }
      });

      // Contar no leídas
      const noLeidas = await prisma.notificacion.count({
        where: {
          IDUsuario: idUsuario,
          Estado: 'no_leida'
        }
      });

      return {
        success: true,
        data: {
          notificaciones: notificaciones.map(n => ({
            ...n,
            Metadata: n.Metadata ? JSON.parse(n.Metadata) : null
          })),
          totalNoLeidas: noLeidas
        }
      };
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return {
        success: false,
        message: 'Error al obtener las notificaciones'
      };
    }
  }

    static async marcarComoLeida(idNotificacion: number, idUsuario: number) {
    try {
      const notificacion = await prisma.notificacion.updateMany({
        where: {
          IDNotificacion: idNotificacion,
          IDUsuario: idUsuario
        },
        data: {
          Estado: 'leida',
          FechaLeida: new Date()
        }
      });

      if (notificacion.count === 0) {
        return {
          success: false,
          message: 'Notificación no encontrada'
        };
      }

      return {
        success: true,
        message: 'Notificación marcada como leída'
      };
    } catch (error) {
      console.error('Error al marcar notificación:', error);
      return {
        success: false,
        message: 'Error al actualizar la notificación'
      };
    }
  }

  static async marcarTodasComoLeidas(idUsuario: number) {
    try {
      await prisma.notificacion.updateMany({
        where: {
          IDUsuario: idUsuario,
          Estado: 'no_leida'
        },
        data: {
          Estado: 'leida',
          FechaLeida: new Date()
        }
      });

      return {
        success: true,
        message: 'Todas las notificaciones marcadas como leídas'
      };
    } catch (error) {
      console.error('Error al marcar notificaciones:', error);
      return {
        success: false,
        message: 'Error al actualizar las notificaciones'
      };
    }
  }

  static async archivar(idNotificacion: number, idUsuario: number) {
    try {
      const notificacion = await prisma.notificacion.updateMany({
        where: {
          IDNotificacion: idNotificacion,
          IDUsuario: idUsuario
        },
        data: {
          Estado: 'archivada'
        }
      });

      if (notificacion.count === 0) {
        return {
          success: false,
          message: 'Notificación no encontrada'
        };
      }

      return {
        success: true,
        message: 'Notificación archivada'
      };
    } catch (error) {
      console.error('Error al archivar notificación:', error);
      return {
        success: false,
        message: 'Error al archivar la notificación'
      };
    }
  }
   
  static async eliminar(idNotificacion: number, idUsuario: number) {
    try {
      const notificacion = await prisma.notificacion.deleteMany({
        where: {
          IDNotificacion: idNotificacion,
          IDUsuario: idUsuario
        }
      });

      if (notificacion.count === 0) {
        return {
          success: false,
          message: 'Notificación no encontrada'
        };
      }

      return {
        success: true,
        message: 'Notificación eliminada'
      };
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      return {
        success: false,
        message: 'Error al eliminar la notificación'
      };
    }
  }

  // ========== MÉTODOS HELPER PARA TIPOS ESPECÍFICOS ==========

  static async notificarActualizacionCampania(
    idCampania: number,
    cambios: string[]
  ) {
    try {
      // Obtener usuarios interesados 
      const registros = await prisma.registroParticipacion.findMany({
        where: { IDCampania: idCampania },
        include: {
          voluntario: {
            include: { usuario: true }
          },
          campania: true
        }
      });

      const notificaciones = registros.map(registro => ({
        idUsuario: registro.voluntario?.usuario?.IDUsuario!,
        tipo: 'campania_actualizada' as TipoNotificacion,
        titulo: 'Campaña Actualizada',
        mensaje: `La campaña "${registro.campania?.Nombre}" ha sido actualizada: ${cambios.join(', ')}`,
        idCampania,
        metadata: { cambios }
      }));

      // Crear todas las notificaciones
      const resultados = await Promise.all(
        notificaciones.map(n => this.crear(n))
      );

      return {
        success: true,
        notificacionesCreadas: resultados.filter(r => r.success).length
      };
    } catch (error) {
      console.error('Error al notificar actualización:', error);
      return {
        success: false,
        message: 'Error al enviar notificaciones'
      };
    }
  }

  static async notificarNuevaPostulacion(
    idCampania: number,
    idVoluntario: number
  ) {
    try {
      const campania = await prisma.campania.findUnique({
        where: { IDCampania: idCampania },
        include: {
          organizacion: {
            include: { usuario: true }
          }
        }
      });

      const voluntario = await prisma.voluntario.findUnique({
        where: { IDVoluntario: idVoluntario },
        select: { Nombre: true }
      });

      if (!campania?.organizacion?.usuario?.IDUsuario) {
        return { success: false, message: 'Organización no encontrada' };
      }

      return await this.crear({
        idUsuario: campania.organizacion.usuario.IDUsuario,
        tipo: 'nueva_postulacion',
        titulo: 'Nueva Postulación',
        mensaje: `${voluntario?.Nombre} se ha postulado a "${campania.Nombre}"`,
        idCampania,
        metadata: {
          idVoluntario,
          nombreVoluntario: voluntario?.Nombre
        }
      });
    } catch (error) {
      console.error('Error al notificar postulación:', error);
      return {
        success: false,
        message: 'Error al enviar notificación'
      };
    }
  }

  static async notificarCertificadoEmitido(
    idCertificado: number,
    idVoluntario: number
  ) {
    try {
      const certificado = await prisma.certificadoHoras.findUnique({
        where: { IDCertificado: idCertificado },
        include: {
          campania: true,
          voluntario: {
            include: { usuario: true }
          }
        }
      });

      if (!certificado?.voluntario?.usuario?.IDUsuario) {
        return { success: false, message: 'Voluntario no encontrado' };
      }

      return await this.crear({
        idUsuario: certificado.voluntario.usuario.IDUsuario,
        tipo: 'certificado_emitido',
        titulo: '¡Certificado Disponible!',
        mensaje: `Tu certificado de ${certificado.HorasTrabajadas} horas por "${certificado.campania?.Nombre}" está listo`,
        idCertificado,
        idCampania: certificado.IDCampania || undefined,
        metadata: {
          horas: certificado.HorasTrabajadas,
          campania: certificado.campania?.Nombre
        }
      });
    } catch (error) {
      console.error('Error al notificar certificado:', error);
      return {
        success: false,
        message: 'Error al enviar notificación'
      };
    }
  }
}
