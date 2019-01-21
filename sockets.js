
/* Чат */

const pool = require('./postgres');

module.exports = io => {

    io.on('connection', async function (socket) {       
        // Лог            
        socket.emit('connected', "Connected to chat");
    
        // Подключение к комнате        
        socket.join('all');
    
        // Обработка сообщения
        socket.on('msg', async content => {
            const obj = {
                date: new Date(),
                content: content,
                username: 'Artem',
                user_id: 1,
                chat_id: 1
            };

            const poolClient = await pool.connect()            
            await poolClient.query('INSERT INTO messages(date, chat_id, content, user_id) VALUES($1, $2, $3, $4)', 
                [
                    obj.date,
                    obj.chat_id,
                    obj.content,
                    obj.user_id
                ]
            );
            poolClient.release();  
            
            socket.emit("message", obj);
            socket.to('all').emit("message", obj);
        });
    
        socket.on('receiveHistory', async () => {
            const poolClient = await pool.connect()            
            const messages = await poolClient.query(queryHistory, 
                [
                    1,
                    1,
                ]
            );
            poolClient.release(); 
            
            socket.emit("history", messages.rows);
        });
    });
}

const queryHistory = `
SELECT 
    m.chat_id AS chat_id,
    m.date AS date,
    m.user_id AS user_id,
    st.name AS username,
    m.content AS content
FROM messages AS m
    INNER JOIN students AS st
        ON m.user_id = st.id
WHERE user_id = $1 AND chat_id = $2 `;