import { NotificationService } from '../services/notification.service';
import { prisma } from '../lib/prisma';

async function crearNotificacionesPrueba() {
  console.log('Creando notificaciones de prueba...\n');

  try {
    // Obtener primer usuario de la base de datos
    const usuario = await prisma.usuario.findFirst({
      where: {
        CorreoElectronico: {
          not: 'admin@example.com' // Excluir admin
        }
      }
    });

    if (!usuario) {
      console.log('No se encontró ningún usuario. Registra un usuario primero.');
      return;
    }

    console.log(`Usuario encontrado: ${usuario.Nombre} (ID: ${usuario.IDUsuario})`);
    console.log('-----------------------------------\n');

    // 1. Notificación de bienvenida
    console.log('Creando notificación de bienvenida...');
    const notif1 = await NotificationService.crear({
      idUsuario: usuario.IDUsuario,
      tipo: 'sistema',
      titulo: '¡Bienvenido a Talento sin Barreras!',
      mensaje: 'Tu cuenta ha sido creada exitosamente. Explora las campañas disponibles y encuentra oportunidades increíbles.',
      metadata: {
        accion: 'registro_completado',
        timestamp: new Date().toISOString()
      }
    });
    console.log(notif1.success ? ' Creada' : 'Error');

    // 2. Notificación de campaña disponible
    console.log('Creando notificación de campaña nueva...');
    const notif2 = await NotificationService.crear({
      idUsuario: usuario.IDUsuario,
      tipo: 'campania_actualizada',
      titulo: 'Nueva Campaña Disponible',
      mensaje: 'Se ha publicado una nueva campaña de "Desarrollador Web" que coincide con tu perfil.',
      metadata: {
        campaniaId: 1,
        categoriaCampania: 'Tecnología'
      }
    });
    console.log(notif2.success ? 'Creada' : 'Error');

    // 3. Notificación de recordatorio
    console.log('Creando notificación de recordatorio...');
    const notif3 = await NotificationService.crear({
      idUsuario: usuario.IDUsuario,
      tipo: 'recordatorio',
      titulo: 'Completa tu Perfil',
      mensaje: 'Completa tu perfil para aumentar tus posibilidades de ser seleccionado en las campañas.',
      metadata: {
        perfilCompletado: 60,
        seccionesFaltantes: ['habilidades', 'experiencia']
      }
    });
    console.log(notif3.success ? 'Creada' : 'Error');

    // 4. Notificación de certificado 
    console.log('Creando notificación de certificado...');
    const notif4 = await NotificationService.crear({
      idUsuario: usuario.IDUsuario,
      tipo: 'certificado_emitido',
      titulo: '¡Certificado Disponible!',
      mensaje: 'Tu certificado de 20 horas por la campaña "Voluntariado Comunitario" está listo para descargar.',
      metadata: {
        horas: 20,
        campania: 'Voluntariado Comunitario',
        fechaEmision: new Date().toISOString()
      }
    });
    console.log(notif4.success ? 'Creada' : 'Error');

    // 5. Notificación de postulación aceptada
    console.log('Creando notificación de postulación aceptada...');
    const notif5 = await NotificationService.crear({
      idUsuario: usuario.IDUsuario,
      tipo: 'postulacion_aceptada',
      titulo: '¡Felicitaciones! Postulación Aceptada',
      mensaje: 'Tu postulación para "Desarrollador Web Inclusivo" ha sido aceptada. Revisa los próximos pasos.',
      metadata: {
        campaniaId: 1,
        campaniaNombre: 'Desarrollador Web Inclusivo',
        fechaInicio: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    console.log(notif5.success ? 'Creada' : 'Error');

    // 6. Notificación de actualización de campaña
    console.log('Creando notificación de actualización...');
    const notif6 = await NotificationService.crear({
      idUsuario: usuario.IDUsuario,
      tipo: 'campania_actualizada',
      titulo: 'Campaña Actualizada',
      mensaje: 'La campaña "Programa de Servicio Social" ha actualizado su fecha de inicio y ubicación.',
      metadata: {
        campaniaId: 2,
        cambios: ['Fecha de inicio', 'Ubicación'],
        fechaNuevaInicio: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    console.log(notif6.success ? 'Creada' : 'Error');

    console.log('\n-----------------------------------');
    console.log('¡Notificaciones de prueba creadas exitosamente!');
    console.log(`Total: 6 notificaciones para el usuario ${usuario.Nombre}`);
    console.log('\nVerifica las notificaciones en el Dashboard');

    // Mostrar resumen
    const resumen = await NotificationService.obtenerPorUsuario(usuario.IDUsuario, {
      limite: 10
    });

    if (resumen.success && resumen.data) {
      console.log(`\nResumen:`);
      console.log(`   - Total notificaciones: ${resumen.data.notificaciones.length}`);
      console.log(`   - No leídas: ${resumen.data.totalNoLeidas}`);
    }

  } catch (error) {
    console.error('\nError al crear notificaciones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  crearNotificacionesPrueba()
    .then(() => {
      console.log('\nScript completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nError:', error);
      process.exit(1);
    });
}

export { crearNotificacionesPrueba };
