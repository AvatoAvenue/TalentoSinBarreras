import { prisma } from '../lib/prisma';
import { NotificationService } from './notification.service';

export interface CrearPostulacionData {
  userId: number; // Cambiado de idVoluntario a userId
  idCampania: number;
  cartaMotivacion: string;
  experiencia: string;
  disponibilidad: string;
  cvFileName?: string;
}

export class PostulacionesService {
  // Crear nueva postulación
  static async crear(data: CrearPostulacionData) {
    try {
      // Buscar voluntario por userId
      const voluntario = await prisma.voluntario.findFirst({
        where: {
          IDUsuario: data.userId
        }
      });

      if (!voluntario) {
        return {
          success: false,
          message: 'Usuario no tiene un perfil de voluntario registrado'
        };
      }

      // Verificar que no exista ya una postulación
      const existente = await prisma.postulacion.findFirst({
        where: {
          IDVoluntario: voluntario.IDVoluntario,
          IDCampania: data.idCampania,
        }
      });

      if (existente) {
        return {
          success: false,
          message: 'Ya has postulado a esta campaña'
        };
      }

      // Crear postulación
      const postulacion = await prisma.postulacion.create({
        data: {
          IDVoluntario: voluntario.IDVoluntario,
          IDCampania: data.idCampania,
          CartaMotivacion: data.cartaMotivacion,
          Experiencia: data.experiencia,
          Disponibilidad: data.disponibilidad,
          CVFileName: data.cvFileName,
          Estado: 'pendiente',
        },
        include: {
          voluntario: {
            include: {
              usuario: true
            }
          },
          campania: {
            include: {
              organizacion: {
                include: {
                  usuario: true
                }
              }
            }
          }
        }
      });

      // Notificar a la organización
      if (postulacion.campania?.organizacion?.usuario?.IDUsuario) {
        await NotificationService.crear({
          idUsuario: postulacion.campania.organizacion.usuario.IDUsuario,
          tipo: 'nueva_postulacion',
          titulo: '¡Nueva Postulación!',
          mensaje: `${postulacion.voluntario.Nombre} se ha postulado a "${postulacion.campania.Nombre}"`,
          idCampania: data.idCampania,
          metadata: {
            idPostulacion: postulacion.IDPostulacion,
            nombreVoluntario: postulacion.voluntario.Nombre,
            fechaPostulacion: postulacion.FechaPostulacion.toISOString()
          }
        });
      }

      return {
        success: true,
        message: 'Postulación enviada exitosamente',
        data: {
          ...postulacion,
          userId: data.userId // Incluir userId en la respuesta
        }
      };
    } catch (error) {
      console.error('Error al crear postulación:', error);
      return {
        success: false,
        message: 'Error al crear la postulación'
      };
    }
  }

  // Obtener postulaciones por organización (mantener igual)
  static async obtenerPorOrganizacion(idUsuarioOrg: number, opciones?: {
    estado?: string;
    idCampania?: number;
  }) {
    try {
      // Obtener organización
      const organizacion = await prisma.organizacion.findFirst({
        where: { IDUsuario: idUsuarioOrg }
      });

      if (!organizacion) {
        return {
          success: false,
          message: 'Organización no encontrada'
        };
      }

      // Construir filtros
      const where: any = {
        campania: {
          IDOrganizacion: organizacion.IDOrganizacion
        }
      };

      if (opciones?.estado) {
        where.Estado = opciones.estado;
      }

      if (opciones?.idCampania) {
        where.IDCampania = opciones.idCampania;
      }

      // Obtener postulaciones
      const postulaciones = await prisma.postulacion.findMany({
        where,
        include: {
          voluntario: {
            include: {
              usuario: {
                select: {
                  Nombre: true,
                  CorreoElectronico: true,
                  Telefono: true
                }
              },
              tutor: {
                select: {
                  Nombre: true,
                  Telefono: true,
                  Parentesco: true
                }
              }
            }
          },
          campania: {
            select: {
              IDCampania: true,
              Nombre: true,
              Descripcion: true
            }
          }
        },
        orderBy: {
          FechaPostulacion: 'desc'
        }
      });

      // Contar por estado
      const totalPendientes = await prisma.postulacion.count({
        where: {
          campania: { IDOrganizacion: organizacion.IDOrganizacion },
          Estado: 'pendiente'
        }
      });

      const totalEnRevision = await prisma.postulacion.count({
        where: {
          campania: { IDOrganizacion: organizacion.IDOrganizacion },
          Estado: 'en_revision'
        }
      });

      return {
        success: true,
        data: {
          postulaciones,
          estadisticas: {
            totalPendientes,
            totalEnRevision,
            total: postulaciones.length
          }
        }
      };
    } catch (error) {
      console.error('Error al obtener postulaciones:', error);
      return {
        success: false,
        message: 'Error al obtener postulaciones'
      };
    }
  }

  // Actualizar estado de postulación (mantener igual)
  static async actualizarEstado(
    idPostulacion: number,
    nuevoEstado: 'en_revision' | 'aceptada' | 'rechazada',
    datos?: {
      motivoRechazo?: string;
      notasOrganizacion?: string;
    }
  ) {
    try {
      const postulacion = await prisma.postulacion.update({
        where: { IDPostulacion: idPostulacion },
        data: {
          Estado: nuevoEstado,
          FechaRespuesta: new Date(),
          MotivoRechazo: datos?.motivoRechazo,
          NotasOrganizacion: datos?.notasOrganizacion
        },
        include: {
          voluntario: {
            include: {
              usuario: true
            }
          },
          campania: true
        }
      });

      // Notificar al voluntario
      if (postulacion.voluntario.usuario) {
        let titulo = '';
        let mensaje = '';
        let tipo: any = 'sistema';

        switch (nuevoEstado) {
          case 'en_revision':
            titulo = 'Postulación en Revisión';
            mensaje = `Tu postulación a "${postulacion.campania.Nombre}" está siendo revisada`;
            tipo = 'sistema';
            break;
          case 'aceptada':
            titulo = '¡Felicitaciones! Postulación Aceptada';
            mensaje = `Tu postulación a "${postulacion.campania.Nombre}" ha sido aceptada. La organización se pondrá en contacto contigo.`;
            tipo = 'postulacion_aceptada';
            break;
          case 'rechazada':
            titulo = 'Postulación No Seleccionada';
            mensaje = `Lamentablemente tu postulación a "${postulacion.campania.Nombre}" no fue seleccionada.${datos?.motivoRechazo ? ` Motivo: ${datos.motivoRechazo}` : ''}`;
            tipo = 'postulacion_rechazada';
            break;
        }

        await NotificationService.crear({
          idUsuario: postulacion.voluntario.usuario.IDUsuario,
          tipo,
          titulo,
          mensaje,
          idCampania: postulacion.IDCampania,
          metadata: {
            idPostulacion: postulacion.IDPostulacion,
            estadoAnterior: 'pendiente',
            estadoNuevo: nuevoEstado
          }
        });
      }

      return {
        success: true,
        message: 'Estado actualizado correctamente',
        data: postulacion
      };
    } catch (error) {
      console.error('Error al actualizar postulación:', error);
      return {
        success: false,
        message: 'Error al actualizar el estado'
      };
    }
  }

  // Obtener detalle de postulación (mantener igual)
  static async obtenerDetalle(idPostulacion: number) {
    try {
      const postulacion = await prisma.postulacion.findUnique({
        where: { IDPostulacion: idPostulacion },
        include: {
          voluntario: {
            include: {
              usuario: {
                select: {
                  Nombre: true,
                  CorreoElectronico: true,
                  Telefono: true,
                  Biografia: true
                }
              },
              tutor: {
                select: {
                  Nombre: true,
                  Telefono: true,
                  Parentesco: true
                }
              }
            }
          },
          campania: {
            include: {
              organizacion: true
            }
          }
        }
      });

      if (!postulacion) {
        return {
          success: false,
          message: 'Postulación no encontrada'
        };
      }

      return {
        success: true,
        data: postulacion
      };
    } catch (error) {
      console.error('Error al obtener detalle:', error);
      return {
        success: false,
        message: 'Error al obtener el detalle'
      };
    }
  }
}
