
/* Чат */
const { Pool } = require('pg');
const pool = new Pool(require('./postgres'));

module.exports = io => {

    io.on('connection', async function (socket) {       
        // Лог            
        socket.emit('connected', "Connected to chat");
    
        // Подключение к комнате        
        socket.join('all');
    
        // Обработка сообщения
        socket.on('msg', async (content, user) => {
            const obj = {
                date: new Date(),
                content: content,
                username: user.name,
                user_id: user.id,
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
    
        socket.on('receiveHistory', async (chat_id) => {
            const poolClient = await pool.connect()            
            const messages = await poolClient.query(queryHistory, 
                [
                    chat_id,
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
WHERE chat_id = $1 `;