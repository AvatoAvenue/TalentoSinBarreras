import prisma from "../src/lib/prisma";
import { PasswordHashing } from "../src/passwordhashing";

async function runSeed() {
  console.log("Iniciando seed...");

  await prisma.$transaction(async (tx) => {
    // Buscar roles existentes primero
    const existingRoles = await tx.rol.findMany();
    
    // Mapa de roles necesarios
    const requiredRoles = [
      { nombre: "Administrador", permisos: "gestion_total" },
      { nombre: "Tutor", permisos: "gestion_tutorados" },
      { nombre: "Voluntario", permisos: "participacion_campanias" },
      { nombre: "Organización", permisos: "gestion_campanias" },
    ];

    const roles: Record<string, any> = {};

    // Para cada rol requerido, buscar si existe o crearlo
    for (const reqRole of requiredRoles) {
      let existingRole = existingRoles.find(r => r.NombreRol === reqRole.nombre);
      
      if (!existingRole) {
        existingRole = await tx.rol.create({
          data: {
            NombreRol: reqRole.nombre,
            PermisosAsociados: reqRole.permisos,
          },
        });
        console.log(`Creado rol: ${reqRole.nombre} con ID: ${existingRole.IDRol}`);
      } else {
        console.log(`Usando rol existente: ${reqRole.nombre} con ID: ${existingRole.IDRol}`);
      }
      
      roles[reqRole.nombre] = existingRole;
    }

    const [existingAdmin, existingTutor, existingVoluntario, existingOrg, existingPostulante] = await Promise.all([
      tx.usuario.findUnique({ where: { CorreoElectronico: "admin@example.com" } }),
      tx.usuario.findUnique({ where: { CorreoElectronico: "tutor@example.com" } }),
      tx.usuario.findUnique({ where: { CorreoElectronico: "voluntario@example.com" } }),
      tx.usuario.findUnique({ where: { CorreoElectronico: "org@example.com" } }),
      tx.usuario.findUnique({ where: { CorreoElectronico: "postulante@example.com" } }),
    ]);

    const [userAdmin, userTutor, userVoluntario, userOrg, userPostulante] = await Promise.all([
      existingAdmin ? Promise.resolve(existingAdmin) : tx.usuario.create({
        data: {
          Nombre: "Admin General",
          CorreoElectronico: "admin@example.com",
          IDRol: roles["Administrador"].IDRol,
          EstadoCuenta: 'activo',
          FechaRegistro: new Date(),
        },
      }),
      existingTutor ? Promise.resolve(existingTutor) : tx.usuario.create({
        data: {
          Nombre: "Tutor Juan",
          CorreoElectronico: "tutor@example.com",
          IDRol: roles["Tutor"].IDRol,
          EstadoCuenta: 'activo',
          FechaRegistro: new Date(),
        },
      }),
      existingVoluntario ? Promise.resolve(existingVoluntario) : tx.usuario.create({
        data: {
          Nombre: "Voluntario Ana",
          CorreoElectronico: "voluntario@example.com",
          IDRol: roles["Voluntario"].IDRol,
          EstadoCuenta: 'activo',
          FechaRegistro: new Date(),
        },
      }),
      existingOrg ? Promise.resolve(existingOrg) : tx.usuario.create({
        data: {
          Nombre: "Organización XYZ",
          CorreoElectronico: "org@example.com",
          IDRol: roles["Organización"].IDRol,
          EstadoCuenta: 'activo',
          FechaRegistro: new Date(),
        },
      }),
      existingPostulante ? Promise.resolve(existingPostulante) : tx.usuario.create({
        data: {
          Nombre: "Postulante Pedro",
          CorreoElectronico: "postulante@example.com",
          IDRol: roles["Voluntario"].IDRol,
          EstadoCuenta: 'activo',
          FechaRegistro: new Date(),
        },
      }),
    ]);

    // Resto del seed sin cambios...
    const hashAdmin = await PasswordHashing.hashPassword("admin123", PasswordHashing.genSalt());
    const hashTutor = await PasswordHashing.hashPassword("tutor123", PasswordHashing.genSalt());
    const hashVol = await PasswordHashing.hashPassword("vol123", PasswordHashing.genSalt());
    const hashOrg = await PasswordHashing.hashPassword("org123", PasswordHashing.genSalt());
    const hashPostulante = await PasswordHashing.hashPassword("post123", PasswordHashing.genSalt());

    // Verificar y crear contraseñas solo si no existen
    const existingPasswords = await tx.contrasenias.findMany({
      where: {
        IDUsuario: {
          in: [userAdmin.IDUsuario, userTutor.IDUsuario, userVoluntario.IDUsuario, userOrg.IDUsuario, userPostulante.IDUsuario]
        }
      }
    });

    const usersToCreatePassword = [
      { id: userAdmin.IDUsuario, hash: hashAdmin, exists: existingPasswords.some(p => p.IDUsuario === userAdmin.IDUsuario) },
      { id: userTutor.IDUsuario, hash: hashTutor, exists: existingPasswords.some(p => p.IDUsuario === userTutor.IDUsuario) },
      { id: userVoluntario.IDUsuario, hash: hashVol, exists: existingPasswords.some(p => p.IDUsuario === userVoluntario.IDUsuario) },
      { id: userOrg.IDUsuario, hash: hashOrg, exists: existingPasswords.some(p => p.IDUsuario === userOrg.IDUsuario) },
      { id: userPostulante.IDUsuario, hash: hashPostulante, exists: existingPasswords.some(p => p.IDUsuario === userPostulante.IDUsuario) },
    ];

    const passwordsToCreate = usersToCreatePassword.filter(u => !u.exists);

    if (passwordsToCreate.length > 0) {
      await tx.contrasenias.createMany({
        data: passwordsToCreate.map(user => ({
          IDUsuario: user.id,
          ContrasenaHash: user.hash,
          Salt: "",
          Activa: true,
          FechaCambio: new Date(),
        })),
      });
    }

    const ubicacionCentro = await tx.ubicacion.create({
      data: {
        Direccion: "Av. Central 123",
        Ciudad: "Ciudad Central",
        Estado: "Estado Central",
        Pais: "Paisland",
        CoordenadasGeograficas: "19.123,-99.123",
      },
    });

    const institucionA = await tx.institucion.create({
      data: {
        Nombre: "Instituto Superior",
        Tipo: "Educativa",
        Contacto: "contacto@instituto.com",
        Direccion: "Calle Educación 45",
        RequisitosValidacion: "Presentar identificación oficial",
      },
    });

    const tutor = await tx.tutor.create({
      data: {
        IDUsuario: userTutor.IDUsuario,
        Nombre: "Tutor Juan",
        FechaNacimiento: new Date("1980-05-10"),
      },
    });

    const voluntario = await tx.voluntario.create({
      data: {
        IDUsuario: userVoluntario.IDUsuario,
        IDTutor: tutor.IDTutor,
        Nombre: "Voluntario Ana",
        FechaNacimiento: new Date("2001-03-20"),
        HorasAcumuladas: 10,
        InstitucionEducativa: "Universidad Nacional",
        TipoDiscapacidad: "ninguna",
      },
    });

    const postulante = await tx.voluntario.create({
      data: {
        IDUsuario: userPostulante.IDUsuario,
        Nombre: "Postulante Pedro",
        FechaNacimiento: new Date("2002-01-15"),
        HorasAcumuladas: 0,
        InstitucionEducativa: "Colegio Nacional",
        TipoDiscapacidad: "ninguna",
      },
    });

    const organizacionA = await tx.organizacion.create({
      data: {
        NombreOrganizacion: "Fundación Manos Unidas",
        TipoOrganizacion: "ONG",
        Responsable: "Laura Responsable",
        Telefono: "555-1234",
        IDUsuario: userOrg.IDUsuario,
        IDUbicacion: ubicacionCentro.IDUbicacion,
        Estado: "verificada",
      },
    });

    const categoriaAmbiental = await tx.categoriaCampania.create({
      data: {
        NombreCategoria: "Ambiental",
        Descripcion: "Campañas ecológicas y de limpieza",
      },
    });

    const campaniaLimpieza = await tx.campania.create({
      data: {
        IDOrganizacion: organizacionA.IDOrganizacion,
        Nombre: "Limpieza del Parque Central",
        Descripcion: "Actividad comunitaria para limpiar áreas verdes",
        FechaInicio: new Date(),
        FechaFin: new Date(Date.now() + 86400000),
        IDUbicacion: ubicacionCentro.IDUbicacion,
        IDCategoria: categoriaAmbiental.IDCategoria,
        CupoMaximo: 50,
        Estado: "abierta",
      },
    });

    const registro1 = await tx.registroParticipacion.create({
      data: {
        IDVoluntario: voluntario.IDVoluntario,
        IDCampania: campaniaLimpieza.IDCampania,
        FechaParticipacion: new Date(),
        HorasTrabajadas: 4,
        Observaciones: "Participación destacada.",
      },
    });

    await tx.certificadoHoras.create({
      data: {
        IDRegistro: registro1.IDRegistro,
        IDVoluntario: voluntario.IDVoluntario,
        IDCampania: campaniaLimpieza.IDCampania,
        IDInstitucion: institucionA.IDInstitucion,
        HorasTrabajadas: 4,
        FechaEmision: new Date(),
        Estado: "validado",
      },
    });

    const tipoMultaA = await tx.tabulacionTiposMulta.create({
      data: {
        TipoMulta: "Inasistencia",
        MontoBase: 100,
        Descripcion: "Multa por no asistir sin justificación",
        RequisitosLiquidarla: "Pago en línea",
      },
    });

    await tx.multa.create({
      data: {
        IDVoluntario: voluntario.IDVoluntario,
        Motivo: "No asistió a la campaña",
        Monto: 100,
        FechaEmision: new Date(),
        Estado: "pendiente",
        IDTipoMulta: tipoMultaA.IDTMultas,
      },
    });

    await tx.resenia.create({
      data: {
        IDUsuario: userVoluntario.IDUsuario,
        TipoComentario: "positivo",
        Contenido: "Gran campaña, excelente organización.",
        Puntuacion: 5,
      },
    });

    await tx.publicacion.create({
      data: {
        IDOrganizacion: organizacionA.IDOrganizacion,
        Titulo: "¡Gracias por participar!",
        Contenido: "Agradecemos a todos los voluntarios.",
        ImagenAdjunta: "https://example.com/imagen.jpg",
      },
    });

    await tx.logro.create({
      data: {
        IDVoluntario: voluntario.IDVoluntario,
        IDCampania: campaniaLimpieza.IDCampania,
        TipoLogro: "Participación Sobresaliente",
        FechaEntrega: new Date(),
      },
    });

    await tx.talleres.create({
      data: {
        Nombre: "Capacitación de Seguridad",
        Descripcion: "Uso correcto de herramientas",
        FechaInicio: new Date(),
        FechaFin: new Date(Date.now() + 3600000 * 2),
        CupoMaximo: 20,
        IDOrganizacion: organizacionA.IDOrganizacion,
        IDUsuario: userAdmin.IDUsuario,
        Estado: "activo",
      },
    });
  });

  console.log("Seed COMPLETADO con éxito.");
}

runSeed()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
