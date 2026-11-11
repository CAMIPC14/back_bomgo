# 🍔 Fast Food API

API REST para una web de fast food, construida con **Node.js**, **Express** y **PostgreSQL** (librería `pg`, sin ORM).

## 📁 Estructura del proyecto

```
back_bomgo/
├── app.js                  # Punto de entrada
├── .env                    # Variables de entorno
├── package.json
├── requests.http           # Ejemplos de peticiones (VS Code REST Client)
├── db/
│   └── pool.js             # Conexión a PostgreSQL
├── controllers/
│   ├── clientes.controller.js
│   ├── categorias.controller.js
│   ├── productos.controller.js
│   ├── pedidos.controller.js
│   └── reportes.controller.js
└── routes/
    ├── clientes.routes.js
    ├── categorias.routes.js
    ├── productos.routes.js
    ├── pedidos.routes.js
    └── reportes.routes.js
```

## ⚙️ Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [PostgreSQL](https://www.postgresql.org/) con la base de datos ya creada

## 🚀 Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd back_bomgo
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear la base de datos (si no existe)

Ejecuta el script SQL para crear las tablas y datos de ejemplo:

```bash
psql -U postgres -f fastfood.sql
```

### 4. Configurar variables de entorno

Edita el archivo `.env` con tus credenciales de PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=fastfood
PORT=3000
```

### 5. Iniciar el servidor

```bash
# Producción
npm start

# Desarrollo (auto-reinicio al guardar)
npm run dev
```

El servidor se inicia en `http://localhost:3000`.

## 📡 Endpoints

### Clientes `/clientes`
| Método | Ruta             | Descripción            |
|--------|------------------|------------------------|
| GET    | `/clientes`      | Listar todos           |
| GET    | `/clientes/:id`  | Obtener por ID         |
| POST   | `/clientes`      | Crear cliente          |
| PUT    | `/clientes/:id`  | Actualizar cliente     |
| DELETE | `/clientes/:id`  | Eliminar cliente       |

### Categorías `/categorias`
| Método | Ruta               | Descripción            |
|--------|--------------------|------------------------|
| GET    | `/categorias`      | Listar todas           |
| GET    | `/categorias/:id`  | Obtener por ID         |
| POST   | `/categorias`      | Crear categoría        |
| PUT    | `/categorias/:id`  | Actualizar categoría   |
| DELETE | `/categorias/:id`  | Eliminar categoría     |

### Productos `/productos`
| Método | Ruta                            | Descripción                     |
|--------|---------------------------------|---------------------------------|
| GET    | `/productos`                    | Listar todos (con categoría)    |
| GET    | `/productos?categoria_id=1`     | Filtrar por categoría           |
| GET    | `/productos/:id`                | Obtener por ID                  |
| POST   | `/productos`                    | Crear producto                  |
| PUT    | `/productos/:id`                | Actualizar producto             |
| DELETE | `/productos/:id`                | Eliminar producto               |

### Pedidos `/pedidos`
| Método | Ruta                     | Descripción                          |
|--------|--------------------------|--------------------------------------|
| GET    | `/pedidos`               | Listar todos                         |
| GET    | `/pedidos/:id`           | Detalle (cliente + items)            |
| POST   | `/pedidos`               | Crear pedido (transaccional)         |
| PATCH  | `/pedidos/:id/estado`    | Cambiar estado                       |

### Reportes `/reportes`
| Método | Ruta                       | Descripción              |
|--------|----------------------------|--------------------------|
| GET    | `/reportes/mas-vendidos`   | Productos más vendidos   |

## 📝 Crear un pedido

```json
POST /pedidos
{
  "cliente_id": 1,
  "items": [
    { "producto_id": 1, "cantidad": 2 },
    { "producto_id": 3, "cantidad": 3 }
  ]
}
```

La API toma el **precio actual** de cada producto, calcula el **total**, y lo hace todo dentro de una **transacción**. Si un producto no existe o no está disponible, se hace rollback.

## 🔒 Estados del pedido

Los estados válidos son: `pendiente`, `preparando`, `entregado`, `cancelado`.

```json
PATCH /pedidos/1/estado
{ "estado": "preparando" }
```

## 🧪 Probar las peticiones

Abre el archivo `requests.http` con la extensión **REST Client** de VS Code y ejecuta cada petición haciendo clic en "Send Request".

## 📌 Códigos HTTP utilizados

| Código | Significado                              |
|--------|------------------------------------------|
| 200    | OK                                       |
| 201    | Recurso creado                           |
| 400    | Datos de entrada inválidos               |
| 404    | Recurso no encontrado                    |
| 409    | Conflicto (email o categoría duplicada)  |
| 500    | Error interno del servidor               |

