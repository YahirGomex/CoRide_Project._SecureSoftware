const express = require('express');
const fs = require('fs');
const path = require('path');
const router = require('./app/controllers/router');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
const port = 3000;

// Configuración segura de CORS
const allowedOrigins = ['https://coride.site']; // Dominios confiables
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No autorizado por CORS.'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Configuración de cabeceras de seguridad
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        `script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://use.fontawesome.com https://cdn.startbootstrap.com; ` +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self'; " +
        "frame-ancestors 'none';" +
        `connect-src 'self' https://coride.site;`
    );
    next();
});

app.use(cookieParser());
app.use(express.json());
app.use(router);
app.use(express.static('app'));
app.use('/images', express.static(path.join(__dirname, 'app/views/images')));
app.use(express.static('app/views'));
app.use('/', express.static(path.join(__dirname, 'app', 'views')));

const dynamoose = require('./app/data/dynamoose.js');

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
