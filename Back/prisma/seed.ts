import prisma from "../src/lib/prisma";

async function runSeed() {
  console.log("Iniciando seed...");

  await prisma.$transaction(async (tx) => {
    //
    // 1. ROLES
    //
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

    //
    // 2. USUARIOS
    //
    const [userAdmin, userTutor, userVoluntario, userOrg] = await Promise.all([
      tx.usuario.create({
        data: {
          Nombre: "Admin General",
          CorreoElectronico: "admin@example.com",
          IDRol: rolAdmin.IDRol,
        },
      }),
      tx.usuario.create({
        data: {
          Nombre: "Tutor Juan",
          CorreoElectronico: "tutor@example.com",
          IDRol: rolUsuario.IDRol,
        },
      }),
      tx.usuario.create({
        data: {
          Nombre: "Voluntario Ana",
          CorreoElectronico: "voluntario@example.com",
          IDRol: rolUsuario.IDRol,
        },
      }),
      tx.usuario.create({
        data: {
          Nombre: "Organizacion XYZ",
          CorreoElectronico: "org@example.com",
          IDRol: rolUsuario.IDRol,
        },
      }),
    ]);

    //
    // 3. CONTRASEÑAS
    //
    await tx.contrasenias.createMany({
      data: [
        {
          IDUsuario: userAdmin.IDUsuario,
          ContrasenaHash: "hash123",
          Salt: "salt123",
        },
        {
          IDUsuario: userTutor.IDUsuario,
          ContrasenaHash: "hash456",
          Salt: "salt456",
        },
        {
          IDUsuario: userVoluntario.IDUsuario,
          ContrasenaHash: "hash789",
          Salt: "salt789",
        },
      ],
    });

    //
    // 4. UBICACIÓN
    //
    const ubicacionCentro = await tx.ubicacion.create({
      data: {
        Direccion: "Av. Central 123",
        Ciudad: "Ciudad Central",
        Estado: "Estado Central",
        Pais: "Paisland",
        CoordenadasGeograficas: "19.123,-99.123",
      },
    });

    //
    // 5. INSTITUCIÓN
    //
    const institucionA = await tx.institucion.create({
      data: {
        Nombre: "Instituto Superior",
        Tipo: "Educativa",
        Contacto: "contacto@instituto.com",
        Direccion: "Calle Educación 45",
        RequisitosValidacion: "Presentar identificación oficial",
      },
    });

    //
    // 6. TUTOR
    //
    const tutor = await tx.tutor.create({
      data: {
        IDUsuario: userTutor.IDUsuario,
        Nombre: "Tutor Juan",
        FechaNacimiento: new Date("1980-05-10"),
      },
    });

    //
    // 7. VOLUNTARIO
    //
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

    //
    // 8. ORGANIZACIÓN
    //
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

    //
    // 9. CATEGORÍA CAMPAÑA
    //
    const categoriaAmbiental = await tx.categoriaCampania.create({
      data: {
        NombreCategoria: "Ambiental",
        Descripcion: "Campañas ecológicas y de limpieza",
      },
    });

    //
    // 10. CAMPAÑA
    //
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

    //
    // 11. REGISTRO PARTICIPACIÓN
    //
    const registro1 = await tx.registroParticipacion.create({
      data: {
        IDVoluntario: voluntario.IDVoluntario,
        IDCampania: campaniaLimpieza.IDCampania,
        FechaParticipacion: new Date(),
        HorasTrabajadas: 4,
        Observaciones: "Participación destacada.",
      },
    });

    //
    // 12. CERTIFICADOS
    //
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

    //
    // 13. TABULACIÓN MULTAS
    //
    const tipoMultaA = await tx.tabulacionTiposMulta.create({
      data: {
        TipoMulta: "Inasistencia",
        MontoBase: 100,
        Descripcion: "Multa por no asistir sin justificación",
        RequisitosLiquidarla: "Pago en línea",
      },
    });

    //
    // 14. MULTA
    //
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

    //
    // 15. RESEÑAS
    //
    await tx.resenia.create({
      data: {
        IDUsuario: userVoluntario.IDUsuario,
        TipoComentario: "positivo",
        Contenido: "Gran campaña, excelente organización.",
        Puntuacion: 5,
      },
    });

    //
    // 16. PUBLICACIONES
    //
    await tx.publicacion.create({
      data: {
        IDOrganizacion: organizacionA.IDOrganizacion,
        Titulo: "¡Gracias por participar!",
        Contenido: "Agradecemos a todos los voluntarios.",
        ImagenAdjunta: "https://example.com/imagen.jpg",
      },
    });

    //
    // 17. LOGROS
    //
    await tx.logro.create({
      data: {
        IDVoluntario: voluntario.IDVoluntario,
        IDCampania: campaniaLimpieza.IDCampania,
        TipoLogro: "Participación Sobresaliente",
        FechaEntrega: new Date(),
      },
    });

    //
    // 18. TALLERES
    //
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

