import prisma from "../src/lib/prisma";
import { PasswordHashing } from "../src/passwordhashing";

async function runSeed() {
  console.log("Iniciando seed...");

  await prisma.$transaction(async (tx) => {
    const [rolAdmin, rolUsuario] = await Promise.all([
      tx.rol.create({
        data: {
          NombreRol: "Administrador",
          PermisosAsociados: "gestion_total",
        },
      }),
      tx.rol.create({
        data: {
          NombreRol: "Usuario",
          PermisosAsociados: "uso_basico",
        },
      }),
    ]);

    const [userAdmin, userTutor, userVoluntario, userOrg] = await Promise.all([
      tx.usuario.create({
        data: {
          Nombre: "Admin General",
          CorreoElectronico: "admin@example.com",
          IDRol: rolAdmin.IDRol,
          EstadoCuenta: 'activo',
          FechaRegistro: new Date(),
        },
      }),
      tx.usuario.create({
        data: {
          Nombre: "Tutor Juan",
          CorreoElectronico: "tutor@example.com",
          IDRol: rolUsuario.IDRol,
          EstadoCuenta: 'activo',
          FechaRegistro: new Date(),
        },
      }),
      tx.usuario.create({
        data: {
          Nombre: "Voluntario Ana",
          CorreoElectronico: "voluntario@example.com",
          IDRol: rolUsuario.IDRol,
          EstadoCuenta: 'activo',
          FechaRegistro: new Date(),
        },
      }),
      tx.usuario.create({
        data: {
          Nombre: "Organizacion XYZ",
          CorreoElectronico: "org@example.com",
          IDRol: rolUsuario.IDRol,
          EstadoCuenta: 'activo',
          FechaRegistro: new Date(),
        },
      }),
    ]);

    // Regenerar contraseñas con el método corregido
    const hashAdmin = await PasswordHashing.hashPassword("admin123", PasswordHashing.genSalt());
    const hashTutor = await PasswordHashing.hashPassword("tutor123", PasswordHashing.genSalt());
    const hashVol = await PasswordHashing.hashPassword("vol123", PasswordHashing.genSalt());
    const hashOrg = await PasswordHashing.hashPassword("org123", PasswordHashing.genSalt());

    await tx.contrasenias.createMany({
      data: [
        {
          IDUsuario: userAdmin.IDUsuario,
          ContrasenaHash: hashAdmin,
          Salt: "",
          Activa: true,
          FechaCambio: new Date(),
        },
        {
          IDUsuario: userTutor.IDUsuario,
          ContrasenaHash: hashTutor,
          Salt: "",
          Activa: true,
          FechaCambio: new Date(),
        },
        {
          IDUsuario: userVoluntario.IDUsuario,
          ContrasenaHash: hashVol,
          Salt: "",
          Activa: true,
          FechaCambio: new Date(),
        },
        {
          IDUsuario: userOrg.IDUsuario,
          ContrasenaHash: hashOrg,
          Salt: "",
          Activa: true,
          FechaCambio: new Date(),
        },
      ],
    });

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
