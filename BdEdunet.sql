CREATE SCHEMA IF NOT EXISTS edunet;
use edunet;
CREATE TABLE usuarios (
  idUsuarios INT NOT NULL AUTO_INCREMENT,
  nombres VARCHAR(45) NOT NULL,
  apellidos VARCHAR(45) NOT NULL,
  correo VARCHAR(45) NOT NULL,
  documento INT NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  direccion VARCHAR(45) NOT NULL,
  password VARCHAR(200) NOT NULL,
  grado varchar(5),
  contacto_emergencia VARCHAR(45),
  telefono_contacto_emergencia VARCHAR(20),
  curso_asignado VARCHAR(20),
  nombre_estudiante_acargo VARCHAR(45),
  parentezco VARCHAR(20),
  cargo_admin VARCHAR(20),
  idRol INT NOT NULL,
  PRIMARY KEY (`idUsuarios`),
  UNIQUE INDEX `correo_UNIQUE` (`correo` ASC) VISIBLE);
  
  
  CREATE TABLE roles(
idRol int primary key auto_increment,
nombreRol varchar(20)
);

ALTER TABLE usuarios 
ADD INDEX userRol_idx (`idRol` ASC) VISIBLE;
;

ALTER TABLE usuarios
ADD CONSTRAINT userRol
  FOREIGN KEY (`idRol`)
  REFERENCES `edunet`.`roles` (`idRol`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
  
INSERT INTO roles (nombreRol) VALUES ("estudiante");
INSERT INTO roles (nombreRol) VALUES ("profesor");
INSERT INTO roles (nombreRol) VALUES ("acudiente");
INSERT INTO roles (nombreRol) VALUES ("administrador");