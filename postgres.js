
/* Конфигурация Базы Данных */


// Подключение к базе данных
const pool = {
    connectionString: 'postgres://postgres:32243551@localhost/hse',
    port: 5432,
    user: 'artem',
    password: '4355',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000 
};

module.exports = pool;