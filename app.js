const express = require('express');
const cookieParser = require('cookie-parser')
const path = require('path');
const bodyParser = require('body-parser');
const cons = require('consolidate');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {serveClient: true});
const passport = require('passport');
const { Strategy } = require('passport-jwt');
const { jwt } = require('./config');


/*
const { Pool } = require('pg');
const dust = require('dustjs-helpers');
const currentWeekNumber = require('current-week-number');
const Intl = require("intl");
// Подключение к базе данных
const pool = new Pool(require('./postgres'));
*/

// Ауентификация
passport.use(new Strategy(jwt, function(jwt_payload, done) {
    if(jwt_payload != void(0)) return done(false, jwt_payload);
    done();
}));





// Установка движка шаблонизатора 
app.engine('dust', cons.dust);

app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

// Установка публичной папки
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser MiddleWare
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

// Cookie Parser
app.use(cookieParser())

// WEB приложение 
require('./router')(app);

// API
require('./api')(app);

// Чат
require('./sockets')(io);

// Аутентификация
require('./auth')(app);
// Запуск сервера
server.listen(1515, function(){
    console.log('Server Started On Port 1515');
});



