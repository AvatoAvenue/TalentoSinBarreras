\connect TalentoSinBarreras;

SELECT pg_sleep(1);

-- Tabla Rol
CREATE TABLE Rol (
    IDRol SERIAL PRIMARY KEY,
    NombreRol VARCHAR(100) NOT NULL,
    PermisosAsociados TEXT
);

-- Tabla Usuario
CREATE TABLE Usuario (
    IDUsuario SERIAL PRIMARY KEY,
    Nombre VARCHAR(150) NOT NULL,
    CorreoElectronico VARCHAR(150) UNIQUE NOT NULL,
    IDRol INT,
    FechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EstadoCuenta VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (EstadoCuenta IN ('activo', 'inactivo', 'suspendido')),
    FOREIGN KEY (IDRol) REFERENCES Rol(IDRol)
);

-- Tabla de Contraseñas
CREATE TABLE Contrasenias (
    IDContrasenia SERIAL PRIMARY KEY,
    IDUsuario INT NOT NULL,
    ContrasenaHash VARCHAR(255) NOT NULL,
    Salt VARCHAR(255) NOT NULL,
    FechaCambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Activa BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (IDUsuario) REFERENCES Usuario(IDUsuario) ON DELETE CASCADE
);

-- Tabla Ubicacion
CREATE TABLE Ubicacion (
    IDUbicacion SERIAL PRIMARY KEY,
    Direccion VARCHAR(255),
    Ciudad VARCHAR(100),
    Estado VARCHAR(100),
    Pais VARCHAR(100),
    CoordenadasGeograficas VARCHAR(255)
);

-- Tabla Institucion
CREATE TABLE Institucion (
    IDInstitucion SERIAL PRIMARY KEY,
    Nombre VARCHAR(150) NOT NULL,
    Tipo TEXT NOT NULL,
    Contacto VARCHAR(150),
    Direccion VARCHAR(255),
    RequisitosValidacion TEXT
);

-- Tabla Tutor
CREATE TABLE Tutor (
    IDTutor SERIAL PRIMARY KEY,
    IDUsuario INT,
    IDVoluntario INT,
    FechaNacimiento DATE,
    Nombre VARCHAR(150),
    FOREIGN KEY (IDUsuario) REFERENCES Usuario(IDUsuario)
);

-- Tabla Voluntario
CREATE TABLE Voluntario (
    IDVoluntario SERIAL PRIMARY KEY,
    IDUsuario INT,
    IDTutor INT,
    FechaNacimiento DATE,
    Nombre VARCHAR(150) NOT NULL,
    HorasAcumuladas INT,
    InstitucionEducativa VARCHAR(150),
    FOREIGN KEY (IDUsuario) REFERENCES Usuario(IDUsuario),
    FOREIGN KEY (IDTutor) REFERENCES Tutor(IDTutor)
);

-- Tabla Organizacion
CREATE TABLE Organizacion (
    IDOrganizacion SERIAL PRIMARY KEY,
    IDUsuario INT,
    NombreOrganizacion VARCHAR(150) NOT NULL,
    TipoOrganizacion VARCHAR(100),
    Responsable VARCHAR(150),
    Telefono VARCHAR(20),
    IDUbicacion INT,
    Estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (Estado IN ('pendiente', 'verificada', 'rechazada')),
    FOREIGN KEY (IDUsuario) REFERENCES Usuario(IDUsuario),
    FOREIGN KEY (IDUbicacion) REFERENCES Ubicacion(IDUbicacion)
);

-- Tabla CategoriaCampaña
CREATE TABLE CategoriaCampania (
    IDCategoria SERIAL PRIMARY KEY,
    NombreCategoria VARCHAR(100),
    Descripcion TEXT
);

-- Tabla Campaña
CREATE TABLE Campania (
    IDCampania SERIAL PRIMARY KEY,
    IDOrganizacion INT,
    Nombre VARCHAR(150),
    Descripcion TEXT,
    FechaInicio DATE,
    FechaFin DATE,
    IDUbicacion INT,
    IDCategoria INT,
    CupoMaximo INT,
    Estado VARCHAR(20) NOT NULL DEFAULT 'abierta' CHECK (Estado IN ('abierta', 'cerrada')),
    FOREIGN KEY (IDOrganizacion) REFERENCES Organizacion(IDOrganizacion),
    FOREIGN KEY (IDUbicacion) REFERENCES Ubicacion(IDUbicacion),
    FOREIGN KEY (IDCategoria) REFERENCES CategoriaCampania(IDCategoria)
);

-- Tabla RegistroParticipacion
CREATE TABLE RegistroParticipacion (
    IDRegistro SERIAL PRIMARY KEY,
    IDVoluntario INT,
    IDCampania INT,
    FechaParticipacion DATE,
    HorasTrabajadas INT,
    Observaciones TEXT,
    FOREIGN KEY (IDVoluntario) REFERENCES Voluntario(IDVoluntario),
    FOREIGN KEY (IDCampania) REFERENCES Campania(IDCampania)
);

-- Tabla CertificadoHoras
CREATE TABLE CertificadoHoras (
    IDCertificado SERIAL PRIMARY KEY,
    IDRegistro INT,
    IDVoluntario INT,
    IDCampania INT,
    IDInstitucion INT,
    HorasTrabajadas INT,
    FechaEmision DATE,
    Estado VARCHAR(20) NOT NULL DEFAULT 'progreso' CHECK (Estado IN ('validado', 'no validado', 'progreso')),
    FOREIGN KEY (IDRegistro) REFERENCES RegistroParticipacion(IDRegistro),
    FOREIGN KEY (IDVoluntario) REFERENCES Voluntario(IDVoluntario),
    FOREIGN KEY (IDCampania) REFERENCES Campania(IDCampania),
    FOREIGN KEY (IDInstitucion) REFERENCES Institucion(IDInstitucion)
);

-- Tabla TabulacionTiposMulta
CREATE TABLE TabulacionTiposMulta (
    IDTMultas SERIAL PRIMARY KEY,
    TipoMulta VARCHAR(150) NOT NULL,
    MontoBase DECIMAL(10,2),
    RequisitosLiquidarla TEXT,
    Descripcion TEXT,
    Activa BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabla Multa
CREATE TABLE Multa (
    IDMulta SERIAL PRIMARY KEY,
    IDVoluntario INT,
    Motivo TEXT,
    Monto DECIMAL(10,2),
    FechaEmision DATE,
    Estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (Estado IN ('pendiente', 'pagada', 'conmutada')),
    IDTipoMulta INT,
    FOREIGN KEY (IDTipoMulta) REFERENCES TabulacionTiposMulta(IDTMultas),
    FOREIGN KEY (IDVoluntario) REFERENCES Voluntario(IDVoluntario)
);

-- Tabla Reseña
CREATE TABLE Resenia (
    IDResenia SERIAL PRIMARY KEY,
    IDUsuario INT,
    TipoComentario VARCHAR(100),
    Contenido TEXT,
    Puntuacion INT CHECK (Puntuacion BETWEEN 1 AND 5),
    FechaPublicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IDUsuario) REFERENCES Usuario(IDUsuario)
);

-- Tabla Publicacion
CREATE TABLE Publicacion (
    IDPublicacion SERIAL PRIMARY KEY,
    IDOrganizacion INT,
    Titulo VARCHAR(150),
    Contenido TEXT,
    FechaPublicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ImagenAdjunta VARCHAR(255),
    FOREIGN KEY (IDOrganizacion) REFERENCES Organizacion(IDOrganizacion)
);

-- Tabla Logro
CREATE TABLE Logro (
    IDLogro SERIAL PRIMARY KEY,
    IDVoluntario INT,
    TipoLogro VARCHAR(100),
    FechaEntrega DATE,
    IDCampania INT,
    FOREIGN KEY (IDVoluntario) REFERENCES Voluntario(IDVoluntario),
    FOREIGN KEY (IDCampania) REFERENCES Campania(IDCampania)
);

-- Tabla de Talleres
CREATE TABLE Talleres (
    IDTaller SERIAL PRIMARY KEY,
    Nombre VARCHAR(150) NOT NULL,
    Descripcion TEXT,
    FechaInicio DATE,
    FechaFin DATE,
    CupoMaximo INT,
    IDOrganizacion INT,
    IDUsuario INT,
    Estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (Estado IN ('activo', 'inactivo', 'cerrado')),
    FOREIGN KEY (IDOrganizacion) REFERENCES Organizacion(IDOrganizacion),
    FOREIGN KEY (IDUsuario) REFERENCES Usuario(IDUsuario)
);
