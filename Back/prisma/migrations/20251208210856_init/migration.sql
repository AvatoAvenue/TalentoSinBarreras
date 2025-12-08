-- CreateEnum
CREATE TYPE "EstadoPostulacion" AS ENUM ('pendiente', 'en_revision', 'aceptada', 'rechazada');

-- CreateTable
CREATE TABLE "Postulacion" (
    "IDPostulacion" SERIAL NOT NULL,
    "IDVoluntario" INTEGER NOT NULL,
    "IDCampania" INTEGER NOT NULL,
    "CartaMotivacion" TEXT NOT NULL,
    "Experiencia" TEXT NOT NULL,
    "Disponibilidad" TEXT NOT NULL,
    "CVFileName" TEXT,
    "Estado" "EstadoPostulacion" NOT NULL DEFAULT 'pendiente',
    "FechaPostulacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "FechaRespuesta" TIMESTAMP(3),
    "MotivoRechazo" TEXT,
    "NotasOrganizacion" TEXT,

    CONSTRAINT "Postulacion_pkey" PRIMARY KEY ("IDPostulacion")
);

-- CreateIndex
CREATE INDEX "Postulacion_IDVoluntario_idx" ON "Postulacion"("IDVoluntario");

-- CreateIndex
CREATE INDEX "Postulacion_IDCampania_idx" ON "Postulacion"("IDCampania");

-- CreateIndex
CREATE INDEX "Postulacion_Estado_idx" ON "Postulacion"("Estado");

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_IDVoluntario_fkey" FOREIGN KEY ("IDVoluntario") REFERENCES "Voluntario"("IDVoluntario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_IDCampania_fkey" FOREIGN KEY ("IDCampania") REFERENCES "Campania"("IDCampania") ON DELETE CASCADE ON UPDATE CASCADE;
