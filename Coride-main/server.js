const express = require('express');
const fs = require('fs');
const path = require('path');
const router = require('./app/controllers/router');
const cors = require('cors');
const Swal= require ('sweetalert2');
const cookieParser = require('cookie-parser');



const app = express();
const port = 3000;

app.use(cookieParser());  
app.use(cors());
app.use(express.json());
app.use(router);
app.use(express.static('app'));
app.use('/images', express.static(path.join(__dirname, 'app/views/images')));
app.use(express.static('app/views'));
app.use('/', express.static(path.join(__dirname, 'app', 'views')));
app.use(cookieParser());




const dynamoose = require('./app/data/dynamoose.js'); 


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
