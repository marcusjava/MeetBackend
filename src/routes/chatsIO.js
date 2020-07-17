const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('../utils/usersChat');
const Chat = require('../models/Chat');

module.exports = function (io) {
	io.on('connection', (socket) => {
		socket.on('join', ({ user_id, username, local, room, avatar }, callback) => {
			const user = userJoin(socket.id, user_id, username, room, avatar, local);

			socket.join(user.room);

			//Boas vindas ao usuario
			socket.emit('message', {
				user: 'Admin',
				text: `${user.username} entrou na sala`,
				avatar: 'http://localhost:3001/uploads/Admin.jpg',
				createdAt: Date.now(),
			});

			//Mensagem aos membros do grupo
			socket.broadcast.to(user.room).emit('message', {
				user: 'Admin',
				text: `O participante ${user.username} entrou na sala`,
				avatar: 'http://localhost:3001/uploads/Admin.jpg',
				createdAt: Date.now(),
			});

			//Enviando informações aos usuarios
			io.to(user.room).emit('roomData', { room: user.room, users: getRoomUsers(user.room) });

			callback();
		});

		try {
			//Inserir no banco
			socket.on('sendMessage', async (msg, callback) => {
				const user = getCurrentUser(socket.id);

				// const chat = new Chat({
				// 	room: user.room,
				// 	avatar: user.avatar,
				// 	user: user.username,
				// 	text: msg,
				// });
				// await chat.save();
				io.to(user.room).emit('message', {
					user_id: user.user_id,
					user: user.username,
					text: msg,
					avatar: user.avatar,
				});
				io.to(user.room).emit('roomData', { room: user.room, users: getRoomUsers(user.room) });
				callback();
			});
		} catch (error) {
			console.log(error);
		}

		socket.on('typing', () => {
			const user = getCurrentUser(socket.id);
			socket.broadcast.to(user.room).emit('typing', `O participante ${user.username} está digitando`);
		});

		socket.on('disconnect', () => {
			const user = userLeave(socket.id);
			console.log('disconnecting');
			if (user) {
				io.to(user.room).emit('message', {
					user: 'Admin',
					text: `${user.username} saiu da sala`,
					avatar: 'http://localhost:3001/uploads/Admin.jpg',
				});
				io.to(user.room).emit('roomData', {
					room: user.room,
					users: getRoomUsers(user.room),
				});
			}
		});
	});
};
