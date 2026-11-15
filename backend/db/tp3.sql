-- ============================================================================
-- TP N.º 3 - Programación IV (UTN FR La Rioja)
-- Script de creación de la base de datos y de todas las tablas.
--
-- Uso manual:
--   mysql -u <usuario> -p < backend/db/tp3.sql
-- O desde la carpeta backend:
--   npm run db:init
--
-- El nombre de la base coincide con DB_NAME del archivo .env.example.
-- ============================================================================
CREATE DATABASE IF NOT EXISTS tp3_vehiculos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tp3_vehiculos;

-- ----------------------------------------------------------------------------
-- Tabla usuario: cuentas para registro e inicio de sesión.
-- contrasena se guarda SIEMPRE como hash de bcrypt (VARCHAR(255)), nunca en
-- texto plano.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario_email (email)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabla vehiculo: flota de la empresa de transporte.
-- capacidad_carga se expresa en kilogramos (admite decimales).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehiculo (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  patente VARCHAR(10) NOT NULL,
  anio SMALLINT UNSIGNED NOT NULL,
  capacidad_carga DECIMAL(8,2) UNSIGNED NOT NULL COMMENT 'Capacidad de carga en kg',
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehiculo_patente (patente),
  CONSTRAINT chk_vehiculo_anio CHECK (anio BETWEEN 1900 AND 2100),
  CONSTRAINT chk_vehiculo_capacidad CHECK (capacidad_carga > 0)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabla conductor: choferes de la empresa.
-- Documento y licencia son únicos; la licencia tiene fecha de alta y de
-- vencimiento (la validez se controla también en el backend).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conductor (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  numero_documento VARCHAR(20) NOT NULL,
  numero_licencia VARCHAR(20) NOT NULL,
  fecha_alta_licencia DATE NOT NULL,
  fecha_vencimiento_licencia DATE NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_conductor_documento (numero_documento),
  UNIQUE KEY uq_conductor_licencia (numero_licencia),
  CONSTRAINT chk_conductor_licencia CHECK (fecha_vencimiento_licencia >= fecha_alta_licencia)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabla viaje: cada viaje asocia un vehículo y un conductor (claves foráneas).
-- kilometros se usa para el cálculo de kilómetros totales por vehículo y por
-- conductor. observaciones es opcional.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS viaje (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehiculo_id INT UNSIGNED NOT NULL,
  conductor_id INT UNSIGNED NOT NULL,
  fecha_salida DATETIME NOT NULL,
  fecha_llegada DATETIME NOT NULL,
  origen VARCHAR(150) NOT NULL,
  destino VARCHAR(150) NOT NULL,
  kilometros DECIMAL(10,2) UNSIGNED NOT NULL,
  observaciones TEXT NULL,
  PRIMARY KEY (id),
  KEY idx_viaje_fecha_salida (fecha_salida),
  CONSTRAINT fk_viaje_vehiculo FOREIGN KEY (vehiculo_id)
    REFERENCES vehiculo (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_viaje_conductor FOREIGN KEY (conductor_id)
    REFERENCES conductor (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_viaje_fechas CHECK (fecha_llegada >= fecha_salida)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
