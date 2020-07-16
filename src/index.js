require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const dayjs = require('dayjs');
const serveIndex = require('serve-index');
const morgan = require('morgan');
const logger = require('./config/logger');

const socketIO = require('socket.io');

//Routes
const users = require('./routes/users');
const meetings = require('./routes/meetings');
const locals = require('./routes/locals');
const chats = require('./routes/chats');

var fs = require('fs');

const app = express();

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
//passport config
require('./config/passport')(passport);

//Handle errors to log
app.use(
	morgan('combined', {
		skip: (req, res) => res.statusCode < 400,
		interval: '7d',
		stream: logger.stream,
	})
);

// Routes

app.use('/api/users', users);
app.use('/api/meetings', meetings);
app.use('/api/locals', locals);
app.use('/api/chats', chats);
//Handle errors to log
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	logger.error(
		`${dayjs(Date.now()).format('DD-MM-YYYYTHH:mm:ssZ')} - ${err.status || 500} - ${
			err.error || 'Internal Error'
		} - ${err.message.message}  - ${req.originalUrl} - ${req.method} - ${req.ip}`
	);

	return res
		.status(err.status || 500)
		.json(err.message || 'Desculpe mas algo errado aconteceu, entre em contato com o administrador');
});

//fazendo com que as imagens fiquem acessiveis
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

//fazendo com que as imagens fiquem acessiveis
app.use(
	'/logs',
	express.static(path.resolve(__dirname, '..', 'logs')),
	serveIndex(path.resolve(__dirname, '..', 'logs'), { icons: true })
);

const expressServer = app.listen(process.env.PORT || 3001, () => {
	console.log(`Server started at port 3001`);
});

global.io = socketIO(expressServer);
require('./routes/chatsIO');
//ChatController(app);
