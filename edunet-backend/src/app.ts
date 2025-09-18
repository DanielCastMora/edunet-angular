
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Conexión a la base de datos
async function connectDB() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
}

// CRUD de usuarios

// Obtener todos los usuarios
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const conn = await connectDB();
    const [rows] = await conn.execute('SELECT * FROM usuarios');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios', details: err });
  }
});

// Crear usuario (registro)
app.post('/api/users', async (req: Request, res: Response) => {
  const {
    nombres,
    apellidos,
    correo,
    documento,
    telefono,
    direccion,
    contrasena,
    grado,
    contacto_emergencia,
    telefono_contacto_emergencia,
    curso_asignado,
    estudiante_relacionado,
    parentesco,
    cargo,
    rol
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const conn = await connectDB();
    const sql = `INSERT INTO usuarios (nombres, apellidos, correo, documento, telefono, direccion, password, grado, contacto_emergencia, telefono_contacto_emergencia, curso_asignado, nombre_estudiante_acargo, parentezco, cargo_admin, idRol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await conn.execute(sql, [
      nombres,
      apellidos,
      correo,
      documento,
      telefono,
      direccion,
      hashedPassword,
      grado,
      contacto_emergencia,
      telefono_contacto_emergencia,
      curso_asignado,
      estudiante_relacionado,
      parentesco,
      cargo,
      rol
    ]);
    await conn.end();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar usuario', details: err });
  }
});

// Obtener usuario por correo
app.get('/api/users/:correo', async (req: Request, res: Response) => {
  const { correo } = req.params;
  try {
    const conn = await connectDB();
    const [rows] = await conn.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    await conn.end();
    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar usuario', details: err });
  }
});

// Actualizar usuario

app.put('/api/users/:correo', async (req: Request, res: Response) => {
  const { correo } = req.params;
  let fields = { ...req.body };
  // Eliminar campos que no existen en la base de datos
  const allowedFields = [
    'nombres', 'apellidos', 'documento', 'telefono', 'direccion', 'password', 'grado',
    'contacto_emergencia', 'telefono_contacto_emergencia', 'curso_asignado',
    'nombre_estudiante_acargo', 'parentezco', 'cargo_admin', 'idRol'
  ];
  // Si se envía 'contrasena', convertirla a 'password' (hasheada)
  if (fields.contrasena) {
    fields.password = await bcrypt.hash(fields.contrasena, 10);
    delete fields.contrasena;
  }
  // Mapear campos del frontend a los de la base de datos
  if (fields.estudiante_relacionado) {
    fields.nombre_estudiante_acargo = fields.estudiante_relacionado;
    delete fields.estudiante_relacionado;
  }
  if (fields.parentesco) {
    fields.parentezco = fields.parentesco;
    delete fields.parentesco;
  }
  if (fields.cargo) {
    fields.cargo_admin = fields.cargo;
    delete fields.cargo;
  }
  if (fields.rol) {
    fields.idRol = fields.rol;
    delete fields.rol;
  }
  // Filtrar solo los campos permitidos
  fields = Object.fromEntries(Object.entries(fields).filter(([key]) => allowedFields.includes(key)));
  try {
    const conn = await connectDB();
    if (Object.keys(fields).length === 0) {
      await conn.end();
      return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
    }
    const setStr = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fields);
    const sql = `UPDATE usuarios SET ${setStr} WHERE correo = ?`;
    await conn.execute(sql, [...values, correo]);
    await conn.end();
    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario', details: err });
  }
});

// Eliminar usuario
app.delete('/api/users/:correo', async (req: Request, res: Response) => {
  const { correo } = req.params;
  try {
    const conn = await connectDB();
    await conn.execute('DELETE FROM usuarios WHERE correo = ?', [correo]);
    await conn.end();
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario', details: err });
  }
});

// Login
app.post('/api/login', async (req: Request, res: Response) => {
  const { usuario, password } = req.body;
  try {
    const conn = await connectDB();
    const [rows] = await conn.execute('SELECT * FROM usuarios WHERE correo = ?', [usuario]);
    await conn.end();
    if (Array.isArray(rows) && rows.length > 0) {
      const user: any = rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (valid) {
        if (user.idRol === 1) {
          res.json({ redirect: '/estudiantes/inicio' });
        } else if (user.idRol === 4) {
          res.json({ redirect: '/principal' });
        } else {
          res.status(400).json({ error: 'Rol no reconocido' });
        }
      } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
      }
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error en login', details: err });
  }
});

// Manejo de errores 404 (Express 5+)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;