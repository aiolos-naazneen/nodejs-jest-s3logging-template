const winston = require('winston');
var S3StreamLogger = require('s3-streamlogger').S3StreamLogger;
const { printf } = winston.format;
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const { anonymizeString } = require('./app/helper');

// configure log levels
winston.configure({
	level: 'debug',
});

// set log format
const myFormat = printf(({ level, message, timestamp }) => {
	const stringifiedMessage = JSON.stringify(message);
	const maskedMessage = anonymizeString(stringifiedMessage);
	return `${timestamp} [${level.toLocaleUpperCase()}]: ${maskedMessage}`;
});

// to create S3 file stream
var create_s3_stream = (file_name) =>
	new S3StreamLogger({
		bucket: process.env.S3_BUCKET_NAME,
		folder: 'logs/auth-logs',
		name_format: `${file_name}_%Y%m%d.log`,
		config: {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			region: process.env.AWS_REGION,
		},
	});

// creates a logger instance keep in the array and return once
const createLogger = (file_name) => {
	// TODO: uncomment s3_stream line when s3 bucket is in place
	// var s3_stream = create_s3_stream(file_name);
	var log_file_name = `logs/${file_name}_${moment().format('YYYYMMDD')}.log`;
	var createdLogger = new winston.createLogger({
		transports: [
			// temporarily writing logs in local 'logs' folder too
			new winston.transports.File({
				filename: log_file_name,
			}),
			// TODO: uncomment s3_stream line when s3 bucket is in place
			// new winston.transports.Stream({ stream: s3_stream }),
		],
	});
	return createdLogger;
};

// get existing logger from allLoggers array or create a new one
const getOrCreateLogger = (file_name, log_id) => {
	let this_logger = createLogger(file_name);
	this_logger.format = winston.format.combine(
		winston.format.timestamp({
			format: `DD-MM-YYYY HH:mm:ss [${log_id}]`,
		}),
		myFormat,
	);
	return this_logger;
};

module.exports = getOrCreateLogger;
