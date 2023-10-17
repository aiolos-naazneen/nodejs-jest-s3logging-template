const db = require('../models');
const {
	userModel: User,
	roleModel: Role,
	refreshTokenModel: RefreshToken,
	templateModel: Template,
	userOtpModel: UserOtp,
} = db;
const moment = require('moment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const ObjectId = require('mongoose').Types.ObjectId;

const helper = require('../helper');

const { sendEmail } = require('../email/email');
const {
	access_token_expiration,
	password_salt_rounds,
	jwt_secret_key,
	default_from_email_address,
} = require('../env_variables');
const { otp_expires_in_minutes } = require('../constants');

exports.login = async (req, res) => {
	let email = req.body.email;
	let password = req.body.password;

	// Bad request error
	if (!email || !password) {
		return helper.response(
			res,
			req.logger,
			false,
			'Bad Request: email and password are required',
			null,
			null,
			400,
		);
	}

	try {
		let check_user = await User.aggregate([
			{
				$match: {
					email,
				},
			},
		]);
		req.logger.info(`check_user: ${JSON.stringify(check_user)}`);

		if (!check_user) {
			return helper.response(
				res,
				req.logger,
				false,
				'User not found',
				null,
				null,
				400,
			);
		}

		User.findOne({
			email: email,
			deletedAt: null,
		})
			.populate({
				path: 'role',
				populate: {
					path: 'permissions',
					populate: [
						{
							path: 'module',
							select: '_id module_name module_slug',
						},
						{
							path: 'sub_modules',
							select: '_id sub_module_name sub_module_slug',
						},
					],
				},
			})
			.then(async (user) => {
				req.logger.info(`user: ${JSON.stringify(user)}`);
				if (!user) {
					return helper.response(
						res,
						req.logger,
						false,
						'User Not Found',
						null,
						null,
						400,
					);
				}
				if (!user.is_active) {
					return helper.response(
						res,
						req.logger,
						false,
						'Account is Inactive',
						null,
						null,
						400,
					);
				}
				let passwordIsValid = bcrypt.compareSync(
					password,
					user.password,
				);
				req.logger.info(`passwordIsValid: ${passwordIsValid}`);
				if (!passwordIsValid) {
					return helper.response(
						res,
						req.logger,
						false,
						'Invalid Password!',
						null,
						null,
						400,
					);
				}

				let token = jwt.sign(
					{
						data: {
							id: user._id,
							email: user.email,
							role: user.role,
							is_active: user.is_active ? true : false,
						},
					},
					jwt_secret_key,
					{
						expiresIn: access_token_expiration,
					},
				);

				user.access_token = token;
				await user.save();
				req.logger.info(`token signed`);

				let refreshToken = await RefreshToken.createToken(user);
				req.logger.info(`refreshToken created: ${refreshToken._id}`);

				let user_data = {
					id: user._id,
					username: user.name,
					change_password: user.change_password,
					accessToken: token,
					refreshToken: refreshToken,
					role: user.role,
					permissions: user.role?.permissions ?? [],
				};

				return helper.response(
					res,
					req.logger,
					true,
					'Login successful!',
					user_data,
					null,
					200,
				);
			});
	} catch (e) {
		req.logger.error(`error_encountered: ${e}`);
		return helper.response(
			res,
			req.logger,
			false,
			'Something went wrong',
			null,
			null,
			500,
		);
	}
};

exports.getAccessToken = async (req, res) => {
	const { refreshToken: requestToken } = req.body;

	if (requestToken == null) {
		return helper.response(
			res,
			false,
			'Refresh token is required!',
			null,
			null,
			403,
		);
	}

	try {
		let refreshToken = await RefreshToken.findOne({ token: requestToken });
		req.logger.info(`refreshToken: ${JSON.stringify(refreshToken)}`);
		if (!refreshToken) {
			return helper.response(
				res,
				false,
				'Refresh token is not in database!',
				null,
				null,
				403,
			);
		}

		if (RefreshToken.verifyExpiration(refreshToken)) {
			RefreshToken.findByIdAndRemove(refreshToken._id, {
				useFindAndModify: false,
			}).exec();
			req.logger.info(
				`refreshToken was expired and removed: ${refreshToken._id}`,
			);
			return helper.response(
				res,
				req.logger,
				false,
				'Refresh token was expired. Please Login Again',
				null,
				null,
				403,
			);
		}

		let newAccessToken = jwt.sign(
			{ id: refreshToken.user_id },
			jwt_secret_key,
			{ expiresIn: access_token_expiration },
		);
		req.logger.info(`newAccessToken was generated`);

		return helper.response(res, req.logger, true, 'Access Token Granted', {
			accessToken: newAccessToken,
		});
	} catch (err) {
		req.logger.error(`error_encountered: ${err}`);
		return helper.response(res, req.logger, false, err, null, null, 500);
	}
};

exports.signUp = async (req, res) => {
	let name = req.body.name || '';
	let email = req.body.email || '';
	let password = req.body.password || '';

	if (!name || !email || !password) {
		return helper.response(
			res,
			req.logger,
			false,
			'Bad Request - enter name, email and role in the request',
			null,
			null,
			400,
		);
	}

	try {
		let check_user = await User.aggregate([
			{
				$match: {
					email,
				},
			},
		]);

		req.logger.info(`check_user: ${JSON.stringify(check_user)}`);
		if (check_user.length) {
			return helper.response(
				res,
				req.logger,
				false,
				'User already exists',
				null,
				null,
				400,
			);
		}

		let hashed_password = await bcrypt.hash(
			password,
			bcrypt.genSaltSync(password_salt_rounds),
		);
		req.logger.info('password hashed');

		let create_user = await new User({
			name,
			email,
			password: hashed_password,
		}).save();

		req.logger.info(`user created: ${create_user?._id}`);

		if (!create_user) {
			return helper.response(
				res,
				req.logger,
				false,
				'Unable to create user',
				null,
				null,
				500,
			);
		}

		return helper.response(
			res,
			req.logger,
			true,
			'User created successfully',
			null,
		);
	} catch (e) {
		console.log(e);
		req.logger.error(`error_encountered: ${e}`);
		return helper.response(
			res,
			req.logger,
			false,
			'Something went wrong',
			null,
			null,
			500,
		);
	}
};

exports.logout = async (req, res) => {
	let user_id = req.AuthData.id;

	try {
		User.findOne({ _id: user_id })
			.then(async (user) => {
				req.logger.info(`user found: ${user._id}`);
				user.access_token = null;
				user.save();
				req.logger.info(`user access_token removed: ${user._id}`);
				await RefreshToken.deleteMany({ user_id });
				req.logger.info(`user refresh_token removed: ${user._id}`);
				return helper.response(
					res,
					req.logger,
					true,
					'Logout Successful',
				);
			})
			.catch((err) => {
				req.logger.error(`error_encountered: ${err}`);
				return helper.response(
					res,
					req.logger,
					false,
					'Something went wrong!',
					null,
					null,
					500,
				);
			});
	} catch (err) {
		req.logger.error(`error_encountered: ${err}`);
		return helper.response(
			res,
			req.logger,
			false,
			'Something went wrong!',
			null,
			null,
			500,
		);
	}
};

exports.sendResetPasswordEmail = async (req, res) => {
	let email = req.body.email || '';

	// Bad request error
	if (!email) {
		return helper.response(
			res,
			req.logger,
			false,
			'Bad Request: email and type should be included',
			null,
			null,
			400,
		);
	}

	try {
		const getOtp = helper.generate6digitOtp();
		let check_user = await User.aggregate([
			{
				$match: {
					email,
				},
			},
			{ $limit: 1 },
		]);
		req.logger.info(`check_user: ${JSON.stringify(check_user)}`);

		if (!check_user[0]) {
			return helper.response(
				res,
				req.logger,
				false,
				'User not found',
				null,
				null,
				400,
			);
		}

		// Find and invalidate old otp
		let old_otp = await UserOtp.findOne({
			user_id: check_user[0]._id,
			used: false,
			is_valid: true,
			deletedAt: null,
		});
		if (old_otp) {
			old_otp.is_valid = false;
			await old_otp.save();
		}

		new UserOtp({
			user_id: check_user[0]._id,
			email: check_user[0].email,
			otp: getOtp.otp,
			otp_valid_till: getOtp.expiresOn,
		})
			.save()
			.then(async (reset_password_request) => {
				req.logger.info(
					`reset password request created: ${reset_password_request._id}`,
				);
				let get_template = await Template.findOne({
					type: 'email',
					slug: 'forgot-password-otp',
				});
				req.logger.info(`template found: ${get_template?._id}`);
				if (!get_template) {
					// Todo: Add error logs here for email template not found
					console.log('Email Template for forgot password not found');
					return helper.response(
						res,
						false,
						'Unable to send reset password link',
						null,
						null,
						500,
					);
				}

				let updatedTemplate = get_template.template;

				let placeholders = get_template.placeholders;

				let replacements = {
					'{{otp}}': getOtp.otp,
					'{{expiry_time_in_minutes}}': `${otp_expires_in_minutes} minutes`,
				};

				placeholders.forEach((placeholder) => {
					const replacement = replacements[placeholder];

					if (replacement) {
						updatedTemplate = updatedTemplate.replace(
							new RegExp(placeholder, 'g'),
							replacement,
						);
					}
				});
				req.logger.info(`template updated`);

				sendEmail(
					check_user[0].email,
					default_from_email_address,
					get_template.subject,
					'',
					updatedTemplate,
				);
				req.logger.info(`email sent`);

				return helper.response(
					res,
					req.logger,
					true,
					'Email sent successfully',
					{},
				);
			})
			.catch((err) => {
				req.logger.error(`error_encountered: ${err}`);
				return helper.response(
					res,
					req.logger,
					false,
					'Unable to send reset password email',
					null,
					null,
					500,
				);
			});
	} catch (err) {
		req.logger.error(`error_encountered: ${err}`);
		return helper.response(
			res,
			req.logger,
			false,
			'Something went wrong',
			null,
			null,
			500,
		);
	}
};

exports.verifyOtp = async (req, res) => {
	let email = req.body.email || '';
	let otp = parseInt(req.body.otp) || '';

	if (!email || !otp) {
		return helper.response(
			res,
			req.logger,
			false,
			'Bad request: email and otp is required',
			null,
			null,
			400,
		);
	}

	try {
		let user = await User.findOne({ email });
		// find password reset OTP created within last expiry minutes and not used
		UserOtp.findOne({
			user_id: user._id,
			used: false,
			is_valid: true,
			createdAt: {
				$gte: moment().subtract(otp_expires_in_minutes, 'minutes'),
			},
			deletedAt: null,
		})
			.then(async (data) => {
				req.logger.info(`data: ${JSON.stringify(data)}`);
				if (!data) {
					return helper.response(
						res,
						req.logger,
						false,
						'Password reset request not found',
						null,
						null,
						400,
					);
				}
				console.log('orp', otp);
				console.log('data', data);
				if (data.otp !== otp) {
					return helper.response(
						res,
						req.logger,
						false,
						'Invalid OTP',
						null,
						null,
						400,
					);
				}

				User.findOne({ _id: data.user_id })
					.populate('role', '-__v')
					.then(async (user) => {
						req.logger.info(`user: ${JSON.stringify(user)}`);
						if (!user) {
							return helper.response(
								res,
								req.logger,
								false,
								'User not found',
								null,
								null,
								400,
							);
						}

						data.usedAt = moment();
						data.used = true;
						await data.save();
						req.logger.info(`reset password request set usedAt`);

						return helper.response(
							res,
							req.logger,
							true,
							'OTP verified successfully',
						);
					})
					.catch((err) => {
						req.logger.error(`error_encountered: ${err}`);
						return helper.response(
							res,
							req.logger,
							false,
							'Something went wrong',
							null,
							null,
							500,
						);
					});
			})
			.catch((err) => {
				req.logger.error(`error_encountered: ${err}`);
				return helper.response(
					res,
					req.logger,
					false,
					'Password reset request not found',
					null,
					null,
					400,
				);
			});
	} catch (err) {
		req.logger.error(`error_encountered: ${err}`);
		return helper.response(
			res,
			req.logger,
			false,
			'Something went wrong',
			null,
			null,
			500,
		);
	}
};

exports.changePassword = async (req, res) => {
	let email = req.body.email || '';
	let new_password = req.body.new_password || '';
	let confirm_password = req.body.confirm_password || '';

	if (!email || !new_password || !confirm_password) {
		return helper.response(
			res,
			req.logger,
			false,
			'Bad request: email, new password and confirm password is required',
			null,
			null,
			400,
		);
	}

	try {
		if (new_password !== confirm_password) {
			return helper.response(
				res,
				req.logger,
				false,
				'Password Mismatch',
				null,
				null,
				400,
			);
		}

		let user = await User.findOne({ email });
		// Valid OTP was used within expiry time
		UserOtp.findOne({
			otp: otp,
			user_id: user._id,
			used: true,
			is_valid: true,
			usedAt: {
				$gte: moment().subtract(otp_expires_in_minutes, 'minutes'),
			},
			deletedAt: null,
		})
			.then(async (data) => {
				req.logger.info(`data: ${JSON.stringify(data)}`);
				if (!data) {
					return helper.response(
						res,
						false,
						'Password reset request not found',
						null,
						null,
						400,
					);
				}

				User.findOne({ _id: data.user_id })
					.populate('role', '-__v')
					.then(async (user) => {
						req.logger.info(`user: ${JSON.stringify(user)}`);
						if (!user) {
							return helper.response(
								res,
								req.logger,
								false,
								'User not found',
								null,
								null,
								400,
							);
						}

						user.password = await bcrypt.hash(
							new_password,
							password_salt_rounds,
						);
						req.logger.info(`password encrypted`);

						await user.save();
						req.logger.info(
							`password changed for user: ${user._id}`,
						);

						data.deletedAt = moment();
						data.used = true;
						await data.save();
						req.logger.info(`reset password request set usedAt`);

						return helper.response(
							res,
							req.logger,
							true,
							'Password changed successfully',
						);
					})
					.catch((err) => {
						req.logger.error(`error_encountered: ${err}`);
						return helper.response(
							res,
							req.logger,
							false,
							'Something went wrong',
							null,
							null,
							500,
						);
					});
			})
			.catch((err) => {
				req.logger.error(`error_encountered: ${err}`);
				return helper.response(
					res,
					req.logger,
					false,
					'Password reset request not found',
					null,
					null,
					400,
				);
			});
	} catch (err) {
		req.logger.error(`error_encountered: ${err}`);
		return helper.response(
			res,
			req.logger,
			false,
			'Something went wrong',
			null,
			null,
			500,
		);
	}
};
