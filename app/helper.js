const crypto = require('crypto');

const constants = require('./constants');
const env_variables = require('./env_variables');
const { default: axios } = require('axios');
const ObjectId = require('mongoose').Types.ObjectId;

const db = require('./models');

const { notificationModel: Notification, templateModel: Template } = db;

exports.response = (
	responseObject,
	logger,
	status,
	message,
	body = null,
	errors = null,
	status_code = 200,
) => {
	logger.log({
		level: status ? 'info' : 'error',
		message: {
			response: {
				status: status ? 1 : 0,
				statusCode: status_code,
				message: message,
				data: body,
				errors: errors,
			},
		},
	});
	return responseObject.status(status_code).send({
		status: status ? 1 : 0,
		statusCode: status_code,
		message: message,
		data: body,
		errors: errors,
	});
};

exports.generateToken = () => {
	const token = crypto.randomBytes(16).toString('hex');
	return token;
};

exports.getErrorBody = (e) => {
	// Extract the validation error messages and fields
	const errorBody = {};
	Object.keys(e.errors).forEach((key) => {
		errorBody[key] = e.errors[key].message;
	});
	return errorBody;
};

exports.generate6digitOtp = () => {
	const otp = Math.floor(100000 + Math.random() * 900000);
	const expiresOn = new Date(
		new Date().getTime() + constants.otp_expires_in_minutes * 60000,
	);
	return { otp: otp, expiresOn: expiresOn };
};

exports.sendSms = async (mobile_numbers, message) => {
	try {
		var mobile_numbers_string = mobile_numbers.join(',');
		const sms_sent = await axios.get(constants.sms_url, {
			params: {
				username: env_variables.sms_username,
				hash: env_variables.sms_hash,
				sender: env_variables.sms_sender,
				message: message,
				numbers: mobile_numbers_string,
			},
		});
	} catch (e) {
		throw e;
	}
};

exports.createNotifications = async (
	channel, // Channels eg: 'email'
	recipients, // array of recipients
	template_slug, // Check from the database collection
	replacements = {}, // array of replacements which is key-value pair of placholders defined in the templates collections
	sender = null, // sender if defined or else will be take from the env
	priority, // High, medium, low
) => {
	try {
		let response = {
			status: false,
			message: '',
		};

		if (!channel) {
			return {
				...response,
				message: 'Please specifiy the channels',
			};
		}

		if (!constants.channels.includes(channel)) {
			return {
				...response,
				message: channel + ' channel does not exists',
			};
		}

		if (recipients.length == 0) {
			return {
				...response,
				message: 'Please specifiy recipients',
			};
		}

		let template_found = await Template.findOne(
			{
				type: channel,
				slug: template_slug,
			},
			{ slug: 1 },
		);

		if (!template_found) {
			return {
				...response,
				message:
					'Template ' +
					template_slug +
					' for channels ' +
					channel +
					' does not exists',
			};
		}

		recipients.map(async (item) => {
			await Notification.create({
				channel,
				recipient: item,
				// sender, sender or use env
				sender: sender ?? env_variables.notifi_sender,
				template_id: new ObjectId(template_found._id),
				replacements,
				priority,
			});
		});

		return {
			...response,
			status: true,
			message: 'Notifications created successfully',
		};
	} catch (error) {
		console.log('Try and Catch Error => ', error.message);
		return {
			...response,
			message: error.message,
		};
	}
};

exports.anonymizeString = (inputString) => {
	// Replace JWT token
	const jwtTokenRegex =
		/(\b[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)(?![A-Za-z0-9-_])/g;
	inputString = inputString.replace(jwtTokenRegex, (match) => {
		if (match.length > 100) {
			const tokenParts = match.split('.');
			const maskedToken =
				tokenParts[0] +
				'.' +
				'X'.repeat(tokenParts[1].length) +
				'.' +
				'X'.repeat(tokenParts[2].length);
			return maskedToken;
		}
		return match;
	});

	const mobileNumberRegex = /([6-9])(\d{7})(\d{2})/g;
	inputString = inputString.replace(
		mobileNumberRegex,
		(match, start, middle, end) => {
			return start + middle[0] + 'X'.repeat(middle.length - 1) + end;
		},
	);

	// Replace email username
	const emailRegex =
		/(\b[A-Za-z0-9]{2})[A-Za-z0-9-_]*(@[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\b)/g;
	inputString = inputString.replace(emailRegex, (match, start, domain) => {
		// find index of @ in match
		const indexOfAt = match.indexOf('@');
		const username = match.substring(0, indexOfAt);
		// keep first and last 2 characters of username and replace others with X
		const updated_username =
			username.substring(0, 2) +
			'X'.repeat(username.length - 4) +
			username.substring(username.length - 2);

		return updated_username + domain;
	});

	return inputString;
};
