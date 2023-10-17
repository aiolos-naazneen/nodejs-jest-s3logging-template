const jwt = require('jsonwebtoken');
const helper = require('../helper');

const moment = require('moment');

module.exports = async (req, res, next) => {
	try {
		//Get auth header value
		const bearerHeader =
			req.headers['authorization'] || req.headers['accessToken'];
		req.logger.info(`bearerHeader: ${bearerHeader}`);
		//check of bearerHeader is not undefined
		if (typeof bearerHeader !== 'undefined') {
			// split at the space
			const bearer = bearerHeader.split(' ');

			let bearerToken = '';

			if (
				typeof bearer[0] !== 'undefined' &&
				typeof bearer[1] !== 'undefined' &&
				bearer[0] == 'Bearer'
			) {
				bearerToken = bearer[1];
			} else {
				bearerToken = bearer[0];
			}
			req.logger.info(`bearerToken: ${bearerToken}`);
			if (!bearerToken) {
				return helper.response(
					res,
					false,
					'Unauthorized Request',
					null,
					null,
					403,
				);
			}

			let decoded = jwt.verify(
				bearerToken,
				process.env.JWT_SECRET_KEY
					? process.env.JWT_SECRET_KEY
					: 'skillskonnect_secret',
			);

			let current_time_in_seconds = moment().unix();
			req.logger.info(
				`current_time_in_seconds: ${current_time_in_seconds}`,
			);
			req.logger.info(`decoded.exp: ${decoded.exp}`);
			if (current_time_in_seconds > decoded.exp) {
				return helper.response(
					res,
					false,
					'Token Expired',
					null,
					null,
					403,
				);
			}
			req.logger.info(
				`decoded.data.is_active: ${decoded.data.is_active}`,
			);
			if (!decoded.data.is_active) {
				return helper.response(
					res,
					false,
					'User not active',
					null,
					null,
					403,
				);
			}

			req.token = bearerToken;
			req.AuthData = decoded.data;
			req.logger.info(`AuthData attached`);
			next();
		} else {
			//Forbidden
			req.logger.info(`Forbidden`);
			return helper.response(
				res,
				req.logger,
				false,
				'Unauthorized Request',
				null,
				null,
				403,
			);
		}
	} catch (err) {
		req.logger.error(`error_encountered: ${err}`);
		if (err.name === 'TokenExpiredError') {
			return helper.response(
				res,
				req.logger,
				false,
				'Token Expired',
				null,
				null,
				403,
			);
		}
		return helper.response(
			res,
			req.logger,
			false,
			'Unable to validate token',
			null,
			err.message,
			403,
		);
	}
};
