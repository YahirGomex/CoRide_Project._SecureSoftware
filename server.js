const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const router = require('./app/controllers/router');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

// Middleware para analizar cookies
app.use(cookieParser());

// Middleware para habilitar CORS con configuración estricta
const allowedOrigins = ['https://coride.site']; // Lista de orígenes permitidos
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
}));

// Middleware para configurar políticas de seguridad con Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], // Solo permite cargar recursos del propio dominio
      scriptSrc: ["'self'", "'unsafe-inline'"], // Permite scripts locales
      objectSrc: ["'none'"], // No permite objetos como Flash o Applets
      imgSrc: ["'self'", 'data:'], // Permite imágenes locales y data URIs
      frameAncestors: ["'self'"], // Previene Clickjacking permitiendo solo iframes del mismo origen
    },
  },
  frameguard: {
    action: 'sameorigin', // Configura X-Frame-Options para SAMEORIGIN
  },
}));

// Middleware para analizar JSON
app.use(express.json());

// Rutas de la aplicación
app.use(router);

// Middleware para servir archivos estáticos
app.use(express.static('app'));
app.use('/images', express.static(path.join(__dirname, 'app/views/images')));

// Inicio del servidor
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
