var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
var indexRouter = require('./app/routes/index');
var authRouter = require('./app/routes/auth');
var settingsRouter = require('./app/routes/settings');
const sendNotification = require('./app/scheduler/sendNotification');
var path = require('path');
var getOrCreateLogger = require('./log');
const addReqLogger = require('./app/middleware/addReqLogger');

var app = express();
// Set debug mode on
mongoose.set('debug', true);
// Establish MONGODB connection using mongoose
mongoose
	.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log(
			'Successfully connected to database:',
			process.env.MONGODB_URL,
		);
	})
	.catch((e) => {
		console.log('Could not connect to the database. Error => ', e);
		process.exit();
	});

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', addReqLogger({ log_file: 'auth' }), authRouter);
app.use('/settings', addReqLogger({ log_file: 'settings' }), settingsRouter);
app.use('/', addReqLogger({ log_file: 'index' }), indexRouter);

// Schedulers
// sendNotification.job();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.json({ error: 'error' });
});

module.exports = app;
