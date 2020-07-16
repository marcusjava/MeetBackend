const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
	transports: [
		new winston.transports.Console({ level: 'info', handleExceptions: true, json: false, colorize: true }),
		new winston.transports.File({
			level: 'info',
			filename: path.join(__dirname, '..', '..', 'logs', 'access.log'),
			handleExceptions: true,
			json: true,
			maxsize: 5242880, // 5MB
			colorize: false,
		}),
	],
	exitOnError: false,
});

logger.stream = {
	write: (info) => {
		logger.info(info);
	},
};

module.exports = logger;
