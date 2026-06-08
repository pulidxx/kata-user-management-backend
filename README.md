# Kata User Management Backend

API REST para gestión de usuarios y clientes con autenticación JWT. Sistema de roles (admin, asesor, consulta) con control de acceso basado en permisos.

## Stack

- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** + **TypeORM**
- **JWT** (autenticación y refresh tokens)
- **Zod** (validación de datos)
- **bcryptjs** (hash de contraseñas)

## Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/pulidxx/kata-user-management-backend.git
cd kata-user-management-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

### 4. Crear base de datos

Crea una base de datos PostgreSQL con el nombre especificado en `.env`. TypeORM creará las tablas automáticamente.

### 5. Iniciar servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:4000`

## Pruebas

```bash
npm test
```
