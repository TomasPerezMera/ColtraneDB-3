# ColtraneDB-2

## Tercera Instancia del proyecto de Base de Datos y Backend para el E-Commerce "El Rincón De Coltrane" (https://github.com/TomasPerezMera/ElReactDeColtrane).-

## Enlace A Deploy: https://coltranedb.onrender.com/

## Stack Tecnológico

- **Backend:** Node.js + Express
- **Template Engine:** Handlebars
- **Base de Datos:** MongoDB con Mongoose
- **Routing:** Socket.io
- **Frontend:** JavaScript + CSS

## Características

- Catálogo de productos con búsqueda
- Sistema de carrito (persistente y local)
- Autenticación de usuarios
- Actualizaciones en tiempo real
- Panel de administración

## Estructura

```
src/
├── config/ # Configuración de Passport
├── models/ # Esquemas de Mongoose
├── middlewares # Sistemas de Auth
├── routes/ # Rutas de API y vistas
├── views/ # Templates Handlebars
├── services/ # Capa de Servicios
├── public/ # Assets estáticos
└── sockets/ # Manejadores Socket.io
```
