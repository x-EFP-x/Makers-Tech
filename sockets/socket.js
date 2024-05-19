import db from '../config/db.js';
import { io } from '../src/server.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const handleSocketConnection = async (socket) => {
    console.log('Se ha conectado un usuario');

    socket.on('disconnect', () => {
        console.log('Se ha desconectado un usuario');
    });

    socket.on('authentication', async (user) => {
        try {
            let msg
            let result;

            const results = await db.execute({
                sql: 'SELECT id, content, user FROM messages WHERE user = ?',
                args: [user ?? 'Edwin']
            });

            msg = await GPTdemo(results.rows);
            let botName = 'ChatBot'
            result = await db.execute({
                sql: 'INSERT INTO messages (content, user) VALUES (:msg, :user)',
                args: { msg, user }
            });
            io.emit('message', msg, result.lastInsertRowid.toString(), botName);

            results.rows.forEach(row => {
                socket.emit('message', row.content, row.id.toString());
            });

        } catch (e) {
            console.error(e);
        }
    });

    socket.on('message', async (msg, username) => {
        const user = username || ' ';
        let result;

        try {
            result = await db.execute({
                sql: 'INSERT INTO messages (content, user) VALUES (:msg, :user)',
                args: { msg, user }
            });
        io.emit('message', msg, result.lastInsertRowid.toString(), username);

        } catch (e) {
            console.error(e);
            return;
        }
        
        const results = await db.execute({
            sql: 'SELECT id, content, user FROM messages WHERE id > ? AND user = ?',
            args: [socket.handshake.auth.serverOffset ?? 0, user ?? 'Edwin']
        });

        msg = await GPTdemo(results.rows);
        let botName = 'ChatBot'
        result = await db.execute({
            sql: 'INSERT INTO messages (content, user) VALUES (:msg, :user)',
            args: { msg, user }
        });
        io.emit('message', msg, result.lastInsertRowid.toString(), botName);
    });

    if (!socket.recovered) {
        try {
            const results = await db.execute({
                sql: 'SELECT id, content, user FROM messages WHERE id > ? AND user = ?',
                args: [socket.handshake.auth.serverOffset ?? 0, socket.handshake.auth.username ?? '']
            });

            results.rows.forEach(row => {
                socket.emit('message', row.content, row.id.toString());
            });
            await GPTdemo(results.rows);
        } catch (e) {
            console.error(e);
        }
    }
};

const initialMessage = 'Debes analizarl y ofrecer a los clientes productos según sus gustos tan pronto comience la conversacion, busca los mas acordes. Si no reconoces gustos, ofrece cosas populares actualmente. Por favor evita los mensajes repetitivos. Siempre hay maximo 10 unidades de un producto es obligatorio que hables de inventario si te preguntan, eres una tienda que tiene todos los productos existentes pero con un inventario limitado, siempre lleva la cuenta';

const GPTdemo = async (results) => {

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const lastMessages = results.map(text => text.content);

    const messages = [
        { role: 'system', content: initialMessage },
        ...lastMessages.map(content => ({ role: 'user', content }))
    ];

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages
        });

        console.log(completion.choices[0].message.content);
        return completion.choices[0].message.content;

    } catch (error) {
        console.error('Error al procesar el texto:', error);
    }
};

export default handleSocketConnection;
