const config = require('./config');
const express = require('express');
const passport = require('passport');

const jwt = require('jsonwebtoken');
// Защита от иньекций
const _ = require('lodash');
// Обращение к БД
const { Pool } = require('pg');
const pool = new Pool(require('./postgres'));
// Хеширует пароль
const bcrypt = require('bcryptjs');





function checkAuth (req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, decryptToken, jwtError) => {
        if(jwtError != void(0) || err != void(0)) return res.render('chat', { error: err || jwtError});
        req.user = decryptToken;
        
        next();
    })(req, res, next);
}

function createToken (body) {
    return jwt.sign(
        body,
        config.jwt.secretOrKey,
        {expiresIn: config.expiresIn}
    );
}

async function createUser(username, password){
    try {
        const passwordHash = bcrypt.hashSync(password, 12);
        const group_id_placeholder = 1; 
        const poolClient = await pool.connect();
        await poolClient.query(qCreateUser, 
            [
                username,
                passwordHash,
                group_id_placeholder,              
                'exaple@ya.ru'
            ]
        );   
     
        const users = await poolClient.query(qGetNewUser);
        poolClient.release()
        return users.rows[0];
        
    } catch (error) {
        
        console.log(error);
    }  
}

async function findUser(username){
    try {
        const name = username.$regex;        
        const poolClient = await pool.connect();
        const users = await poolClient.query('SELECT * FROM students WHERE name = $1', [name]);
        poolClient.release();
        
        if (users.rowCount == 0) {
            console.log("User not found");
            return null;
        } else {
            const user = users.rows[0] 
            console.log(user);
            return user;
        }

    } catch (error) {
        console.log(error);        
    }
}

module.exports = app => {
    // Чат
    app.get('/chat', checkAuth, function(request, response){
        
        response.render('chat', { username: request.user.username, user_id: request.user.id });
    });

    // Авторизация
    app.post('/login', async (req, res) => {
        try {
            let user = await findUser({$regex: _.escapeRegExp(req.body.username), $options: "i"});
            if(user != null && bcrypt.compareSync(req.body.password, user.password)) {
                const token = createToken({id: user.id, username: user.name});
                res.cookie('token', token, {
                    httpOnly: true
                });
                
                res.status(200).send({message: "Успешная Авторизация"});
            } else res.status(400).send({message: "Данные пользователя не корректны"});
        } catch (e) {
            console.error("E, login,", e);
            res.status(500).send({message: "some error"});
        }
    });

    // Регистрация
    app.post('/register', async (req, res) => {
        try {
            let user = await findUser({$regex: _.escapeRegExp(req.body.username), $options: "i"});
            console.log(user);
            
            if(user != null) return res.status(400).send({message: "Имя пользователя занято"});

            user = createUser(req.body.username, req.body.password);

            const token = createToken({id: user.id, username: user.name});

            res.cookie('token', token, {
                httpOnly: true
            });

            res.status(200).send({message: "Успешная регистрация"});

        } catch (e) {
            console.error("E, register,", e);
            res.status(500).send({message: "some error"});
        }
    });

    // Выход
    app.post('/logout', (req, res) => {
        res.clearCookie('token');
        res.status(200).send({message: "Logout success."});
    })
}


const qCreateUser = 'INSERT INTO students(name, password, group_id, email) VALUES($1, $2, $3, $4)';
const qGetNewUser = 'SELECT * FROM students ORDER BY id DESC LIMIT 1';

module.exports.checkAuth = checkAuth;