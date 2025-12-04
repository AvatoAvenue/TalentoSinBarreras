-- CreateEnum
CREATE TYPE "EstadoCuenta" AS ENUM ('activo', 'inactivo', 'suspendido');

-- CreateEnum
CREATE TYPE "EstadoOrganizacion" AS ENUM ('pendiente', 'verificada', 'rechazada');

-- CreateEnum
CREATE TYPE "EstadoCampania" AS ENUM ('abierta', 'cerrada');

-- CreateEnum
CREATE TYPE "EstadoCertificado" AS ENUM ('validado', 'no_validado', 'progreso');

-- CreateEnum
CREATE TYPE "EstadoMulta" AS ENUM ('pendiente', 'pagada', 'conmutada');

-- CreateEnum
CREATE TYPE "EstadoTaller" AS ENUM ('activo', 'inactivo', 'cerrado');

-- CreateEnum
CREATE TYPE "TipoDiscapacidad" AS ENUM ('visual', 'auditiva', 'motriz', 'cognitiva', 'multiple', 'ninguna');

-- CreateTable
CREATE TABLE "Rol" (
    "IDRol" SERIAL NOT NULL,
    "NombreRol" TEXT NOT NULL,
    "PermisosAsociados" TEXT,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("IDRol")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "IDUsuario" SERIAL NOT NULL,
    "Nombre" TEXT NOT NULL,
    "CorreoElectronico" TEXT NOT NULL,
    "IDRol" INTEGER,
    "FechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "EstadoCuenta" "EstadoCuenta" NOT NULL DEFAULT 'activo',
    "Telefono" TEXT,
    "Biografia" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("IDUsuario")
);

-- CreateTable
CREATE TABLE "Contrasenias" (
    "IDContrasenia" SERIAL NOT NULL,
    "IDUsuario" INTEGER NOT NULL,
    "ContrasenaHash" TEXT NOT NULL,
    "Salt" TEXT NOT NULL,
    "FechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Contrasenias_pkey" PRIMARY KEY ("IDContrasenia")
);

-- CreateTable
CREATE TABLE "Ubicacion" (
    "IDUbicacion" SERIAL NOT NULL,
    "Direccion" TEXT,
    "Ciudad" TEXT,
    "Estado" TEXT,
    "Pais" TEXT,
    "CoordenadasGeograficas" TEXT,

    CONSTRAINT "Ubicacion_pkey" PRIMARY KEY ("IDUbicacion")
);

-- CreateTable
CREATE TABLE "Institucion" (
    "IDInstitucion" SERIAL NOT NULL,
    "Nombre" TEXT NOT NULL,
    "Tipo" TEXT NOT NULL,
    "Contacto" TEXT,
    "Direccion" TEXT,
    "RequisitosValidacion" TEXT,

    CONSTRAINT "Institucion_pkey" PRIMARY KEY ("IDInstitucion")
);

-- CreateTable
CREATE TABLE "Tutor" (
    "IDTutor" SERIAL NOT NULL,
    "IDUsuario" INTEGER,
    "FechaNacimiento" TIMESTAMP(3),
    "Nombre" TEXT,
    "Parentesco" TEXT,
    "Telefono" TEXT,
    "DireccionCompleta" TEXT,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("IDTutor")
);

-- CreateTable
CREATE TABLE "Voluntario" (
    "IDVoluntario" SERIAL NOT NULL,
    "IDUsuario" INTEGER,
    "IDTutor" INTEGER,
    "FechaNacimiento" TIMESTAMP(3),
    "Nombre" TEXT NOT NULL,
    "HorasAcumuladas" INTEGER DEFAULT 0,
    "InstitucionEducativa" TEXT,
    "TipoDiscapacidad" "TipoDiscapacidad" NOT NULL DEFAULT 'ninguna',
    "AdaptacionesRequeridas" TEXT,
    "Habilidades" TEXT,

    CONSTRAINT "Voluntario_pkey" PRIMARY KEY ("IDVoluntario")
);

-- CreateTable
CREATE TABLE "Organizacion" (
    "IDOrganizacion" SERIAL NOT NULL,
    "IDUsuario" INTEGER,
    "NombreOrganizacion" TEXT NOT NULL,
    "TipoOrganizacion" TEXT,
    "Responsable" TEXT,
    "Telefono" TEXT,
    "IDUbicacion" INTEGER,
    "Estado" "EstadoOrganizacion" NOT NULL DEFAULT 'pendiente',
    "CategoriaPrincipal" TEXT,
    "Descripcion" TEXT,
    "SitioWeb" TEXT,

    CONSTRAINT "Organizacion_pkey" PRIMARY KEY ("IDOrganizacion")
);

-- CreateTable
CREATE TABLE "CategoriaCampania" (
    "IDCategoria" SERIAL NOT NULL,
    "NombreCategoria" TEXT,
    "Descripcion" TEXT,

    CONSTRAINT "CategoriaCampania_pkey" PRIMARY KEY ("IDCategoria")
);

-- CreateTable
CREATE TABLE "Campania" (
    "IDCampania" SERIAL NOT NULL,
    "IDOrganizacion" INTEGER,
    "Nombre" TEXT,
    "Descripcion" TEXT,
    "FechaInicio" TIMESTAMP(3),
    "FechaFin" TIMESTAMP(3),
    "IDUbicacion" INTEGER,
    "IDCategoria" INTEGER,
    "CupoMaximo" INTEGER,
    "Estado" "EstadoCampania" NOT NULL DEFAULT 'abierta',

    CONSTRAINT "Campania_pkey" PRIMARY KEY ("IDCampania")
);

-- CreateTable
CREATE TABLE "RegistroParticipacion" (
    "IDRegistro" SERIAL NOT NULL,
    "IDVoluntario" INTEGER,
    "IDCampania" INTEGER,
    "FechaParticipacion" TIMESTAMP(3),
    "HorasTrabajadas" INTEGER,
    "Observaciones" TEXT,

    CONSTRAINT "RegistroParticipacion_pkey" PRIMARY KEY ("IDRegistro")
);

-- CreateTable
CREATE TABLE "CertificadoHoras" (
    "IDCertificado" SERIAL NOT NULL,
    "IDRegistro" INTEGER,
    "IDVoluntario" INTEGER,
    "IDCampania" INTEGER,
    "IDInstitucion" INTEGER,
    "HorasTrabajadas" INTEGER,
    "FechaEmision" TIMESTAMP(3),
    "Estado" "EstadoCertificado" NOT NULL DEFAULT 'progreso',

    CONSTRAINT "CertificadoHoras_pkey" PRIMARY KEY ("IDCertificado")
);

-- CreateTable
CREATE TABLE "TabulacionTiposMulta" (
    "IDTMultas" SERIAL NOT NULL,
    "TipoMulta" TEXT NOT NULL,
    "MontoBase" DECIMAL(65,30),
    "RequisitosLiquidarla" TEXT,
    "Descripcion" TEXT,
    "Activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TabulacionTiposMulta_pkey" PRIMARY KEY ("IDTMultas")
);

-- CreateTable
CREATE TABLE "Multa" (
    "IDMulta" SERIAL NOT NULL,
    "IDVoluntario" INTEGER,
    "Motivo" TEXT,
    "Monto" DECIMAL(65,30),
    "FechaEmision" TIMESTAMP(3),
    "Estado" "EstadoMulta" NOT NULL DEFAULT 'pendiente',
    "IDTipoMulta" INTEGER,

    CONSTRAINT "Multa_pkey" PRIMARY KEY ("IDMulta")
);

-- CreateTable
CREATE TABLE "Resenia" (
    "IDResenia" SERIAL NOT NULL,
    "IDUsuario" INTEGER,
    "TipoComentario" TEXT,
    "Contenido" TEXT,
    "Puntuacion" INTEGER,
    "FechaPublicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resenia_pkey" PRIMARY KEY ("IDResenia")
);

-- CreateTable
CREATE TABLE "Publicacion" (
    "IDPublicacion" SERIAL NOT NULL,
    "IDOrganizacion" INTEGER,
    "Titulo" TEXT,
    "Contenido" TEXT,
    "FechaPublicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ImagenAdjunta" TEXT,

    CONSTRAINT "Publicacion_pkey" PRIMARY KEY ("IDPublicacion")
);

-- CreateTable
CREATE TABLE "Logro" (
    "IDLogro" SERIAL NOT NULL,
    "IDVoluntario" INTEGER,
    "TipoLogro" TEXT,
    "FechaEntrega" TIMESTAMP(3),
    "IDCampania" INTEGER,

    CONSTRAINT "Logro_pkey" PRIMARY KEY ("IDLogro")
);

-- CreateTable
CREATE TABLE "Talleres" (
    "IDTaller" SERIAL NOT NULL,
    "Nombre" TEXT NOT NULL,
    "Descripcion" TEXT,
    "FechaInicio" TIMESTAMP(3),
    "FechaFin" TIMESTAMP(3),
    "CupoMaximo" INTEGER,
    "IDOrganizacion" INTEGER,
    "IDUsuario" INTEGER,
    "Estado" "EstadoTaller" NOT NULL DEFAULT 'activo',

    CONSTRAINT "Talleres_pkey" PRIMARY KEY ("IDTaller")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_CorreoElectronico_key" ON "Usuario"("CorreoElectronico");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_IDUsuario_key" ON "Tutor"("IDUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "Voluntario_IDUsuario_key" ON "Voluntario"("IDUsuario");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_IDRol_fkey" FOREIGN KEY ("IDRol") REFERENCES "Rol"("IDRol") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrasenias" ADD CONSTRAINT "Contrasenias_IDUsuario_fkey" FOREIGN KEY ("IDUsuario") REFERENCES "Usuario"("IDUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutor" ADD CONSTRAINT "Tutor_Usuario_fkey" FOREIGN KEY ("IDUsuario") REFERENCES "Usuario"("IDUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voluntario" ADD CONSTRAINT "Voluntario_Usuario_fkey" FOREIGN KEY ("IDUsuario") REFERENCES "Usuario"("IDUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voluntario" ADD CONSTRAINT "Voluntario_Tutor_fkey" FOREIGN KEY ("IDTutor") REFERENCES "Tutor"("IDTutor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organizacion" ADD CONSTRAINT "Organizacion_IDUsuario_fkey" FOREIGN KEY ("IDUsuario") REFERENCES "Usuario"("IDUsuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organizacion" ADD CONSTRAINT "Organizacion_IDUbicacion_fkey" FOREIGN KEY ("IDUbicacion") REFERENCES "Ubicacion"("IDUbicacion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campania" ADD CONSTRAINT "Campania_IDOrganizacion_fkey" FOREIGN KEY ("IDOrganizacion") REFERENCES "Organizacion"("IDOrganizacion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campania" ADD CONSTRAINT "Campania_IDUbicacion_fkey" FOREIGN KEY ("IDUbicacion") REFERENCES "Ubicacion"("IDUbicacion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campania" ADD CONSTRAINT "Campania_IDCategoria_fkey" FOREIGN KEY ("IDCategoria") REFERENCES "CategoriaCampania"("IDCategoria") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroParticipacion" ADD CONSTRAINT "RegistroParticipacion_IDVoluntario_fkey" FOREIGN KEY ("IDVoluntario") REFERENCES "Voluntario"("IDVoluntario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroParticipacion" ADD CONSTRAINT "RegistroParticipacion_IDCampania_fkey" FOREIGN KEY ("IDCampania") REFERENCES "Campania"("IDCampania") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificadoHoras" ADD CONSTRAINT "CertificadoHoras_IDRegistro_fkey" FOREIGN KEY ("IDRegistro") REFERENCES "RegistroParticipacion"("IDRegistro") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificadoHoras" ADD CONSTRAINT "CertificadoHoras_IDVoluntario_fkey" FOREIGN KEY ("IDVoluntario") REFERENCES "Voluntario"("IDVoluntario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificadoHoras" ADD CONSTRAINT "CertificadoHoras_IDCampania_fkey" FOREIGN KEY ("IDCampania") REFERENCES "Campania"("IDCampania") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificadoHoras" ADD CONSTRAINT "CertificadoHoras_IDInstitucion_fkey" FOREIGN KEY ("IDInstitucion") REFERENCES "Institucion"("IDInstitucion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Multa" ADD CONSTRAINT "Multa_IDTipoMulta_fkey" FOREIGN KEY ("IDTipoMulta") REFERENCES "TabulacionTiposMulta"("IDTMultas") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Multa" ADD CONSTRAINT "Multa_IDVoluntario_fkey" FOREIGN KEY ("IDVoluntario") REFERENCES "Voluntario"("IDVoluntario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resenia" ADD CONSTRAINT "Resenia_IDUsuario_fkey" FOREIGN KEY ("IDUsuario") REFERENCES "Usuario"("IDUsuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_IDOrganizacion_fkey" FOREIGN KEY ("IDOrganizacion") REFERENCES "Organizacion"("IDOrganizacion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logro" ADD CONSTRAINT "Logro_IDVoluntario_fkey" FOREIGN KEY ("IDVoluntario") REFERENCES "Voluntario"("IDVoluntario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logro" ADD CONSTRAINT "Logro_IDCampania_fkey" FOREIGN KEY ("IDCampania") REFERENCES "Campania"("IDCampania") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Talleres" ADD CONSTRAINT "Talleres_IDOrganizacion_fkey" FOREIGN KEY ("IDOrganizacion") REFERENCES "Organizacion"("IDOrganizacion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Talleres" ADD CONSTRAINT "Talleres_IDUsuario_fkey" FOREIGN KEY ("IDUsuario") REFERENCES "Usuario"("IDUsuario") ON DELETE SET NULL ON UPDATE CASCADE;
