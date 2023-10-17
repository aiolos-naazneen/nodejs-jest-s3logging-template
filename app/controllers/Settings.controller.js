const bcrypt = require('bcrypt');
const db = require('../models');
const helper = require('../helper');
const password_salt_rounds = parseInt(process.env.PASSWORD_SALT_ROUNDS) || 10;

const {
	userModel: User,
	roleModel: Role,
	moduleModel: Module,
	subModuleModel: SubModule,
	roleModuleMappingModel: RoleModuleMapping,
} = db;
const ObjectId = require('mongoose').Types.ObjectId;
const helper = require('../helper');

const bcrypt = require('bcrypt');

// const { userModel: User } = db;

exports.resetPassword = async (req, res) => {
	let user_id = req.AuthData.id;
	let new_password = req.body.newPassword || '';
	let confirm_password = req.body.confirmPassword || '';
	let password = req.body.password || '';

	if (!new_password && !confirm_password) {
		return helper.response(
			res,
			req.logger,
			false,
			'Bad request: New password and confirm password is required',
			null,
			null,
			500,
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
		const user = await User.findOne({
			_id: user_id,
		});
		req.logger.info(`user: ${user?.id}`);
		if (!user) {
			return helper.response(
				res,
				req.logger,
				false,
				'User not found',
				null,
				null,
				404,
			);
		}

		// if user had come first time

		if (password) {
			const passwordMatch = bcrypt.compareSync(password, user.password);
			req.logger.info(`passwordMatch: ${passwordMatch}`);
			if (!passwordMatch) {
				return helper.response(
					res,
					req.logger,
					false,
					'Password wrong',
					null,
					null,
					500,
				);
			}
		}
		const hashedPassword = await bcrypt.hash(
			new_password,
			bcrypt.genSaltSync(password_salt_rounds),
		);
		req.logger.info(`password encrypted`);
		user.password = hashedPassword;

		// if user changes password for the first time
		if (user.change_password) {
			user.change_password = false;
		}
		await user.save();
		req.logger.info(`user saved: ${user?.id}`);

		let user_data = {
			id: user._id,
			username: user.name,
		};

		return helper.response(
			res,
			req.logger,
			true,
			'Password changed successfully',
			user_data,
		);
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

exports.getModules = async (req, res) => {
	let type = req.query.type || ''; // text field

	if (!type) {
		return helper.response(
			res,
			req.logger,
			false,
			'Bad request: Type should be specified',
			null,
			null,
			400,
		);
	}

	try {
		let modules = await Module.find({
			type,
		}).populate('sub_modules');

		if (!modules) {
			return helper.response(
				res,
				req.logger,
				false,
				'No module defined for this role',
				null,
				null,
				403,
			);
		}

		return helper.response(res, req.logger, true, 'Modules found', modules);
	} catch (e) {
		req.logger.error(`error encountered: ${e}`);
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

exports.addRole = async (req, res) => {
	console.log(req.body, 'line 84');
	let role = req.body.role || '';
	let permission = req.body.permissions || '';

	if (!role || !permission) {
		return helper.response(
			res,
			req.logger,
			false,
			'Bad request: Role and Permission are required',
			null,
			null,
			400,
		);
	}

	try {
		let permissions = [];

		if (permission.length === 0) {
			return helper.response(
				res,
				req.logger,
				false,
				'No permissions defined',
				null,
				null,
				400,
			);
		}

		permission.forEach((item) => {
			let module_included = false;
			let sub_modules = [];

			item.sub_modules?.forEach((element) => {
				if (element.included) {
					if (module_included == false) {
						module_included = true;
					}

					sub_modules.push(element.id);
				}
			});

			if (module_included) {
				permissions.push({
					module: item.id,
					sub_modules,
				});
			}
		});

		await Role.create({
			type: 'super-admin',
			role: helper.getSlug(role),
			display_name: role,
			permissions,
		})
			.then(() => {
				return helper.response(
					res,
					req.logger,
					true,
					'Role created successfully',
				);
			})
			.catch((e) => {
				req.logger.error(`error encountered: ${e}`);

				return helper.response(
					res,
					req.logger,
					false,
					'Unable to create Role',
					null,
					null,
					500,
				);
			});
	} catch (error) {
		req.logger.error(`error encountered: ${error}`);

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

exports.getRoleList = async (req, res) => {
	let type = req.query.type || '';

	if (!type) {
		return helper.response(
			res,
			req.logger,
			false,
			'Bad request: Type are required',
			null,
			null,
			400,
		);
	}

	try {
		await Role.aggregate([
			{
				$match: {
					type,
					deletedAt: null,
				},
			},
			{
				$unwind: '$permissions',
			},
			{
				$lookup: {
					from: 'modules',
					localField: 'permissions.module',
					foreignField: '_id',
					as: 'permissions.module',
				},
			},
			{
				$group: {
					_id: '$_id',
					type: { $first: '$type' },
					role: { $first: '$role' },
					display_name: { $first: '$display_name' },
					permissions: { $push: '$permissions' },
				},
			},
		])
			.then((list) => {
				// Todo: Add db Query logs here
				return helper.response(
					res,
					req.logger,
					true,
					'Roles found',
					list,
				);
			})
			.catch((e) => {
				req.logger.error(`error encountered: ${e}`);

				return helper.response(
					res,
					req.logger,
					false,
					'Unable to create Role',
					null,
					null,
					500,
				);
			});
	} catch (error) {
		req.logger.error(`error encountered: ${error}`);

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

exports.getRoleDetails = async (req, res) => {
	let id = req.params.id || '';

	if (!id) {
		return helper.response(
			res,
			req.logger,
			false,
			'Bad request: Role Id is required',
			null,
			null,
			400,
		);
	}

	try {
		await Role.aggregate([
			{
				$match: {
					_id: new ObjectId(id),
					deletedAt: null,
				},
			},
			{
				$unwind: '$permissions',
			},
			{
				$lookup: {
					from: 'modules',
					localField: 'permissions.module',
					foreignField: '_id',
					as: 'permissions.module',
				},
			},
			{
				$group: {
					_id: '$_id',
					display_name: { $first: '$display_name' },
					permissions: { $push: '$permissions' },
				},
			},
			{
				$project: {
					_id: 1,
					display_name: 1,
					'permissions.module._id': 1,
					'permissions.module.type': 1,
					'permissions.module.module_name': 1,
					'permissions.sub_modules': 1,
				},
			},
			{
				$limit: 1,
			},
		])
			.then((role) => {
				if (!role) {
					return helper.response(
						res,
						req.logger,
						false,
						'Role not found',
					);
				}

				role_details = role[0];

				// Todo: Add db Query logs here
				return helper.response(
					res,
					req.logger,
					true,
					'Role details',
					role_details,
				);
			})
			.catch((e) => {
				req.logger.error(`error encountered: ${e}`);

				return helper.response(
					res,
					req.logger,
					false,
					'Unable to fetch Role details',
					null,
					null,
					500,
				);
			});
	} catch (error) {
		req.logger.error(`error encountered: ${error}`);

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

exports.deleteRole = async (req, res) => {
	let id = req.body.id || '';

	if (!id) {
		return helper.response(
			res,
			req.logger,

			false,
			'Bad request: Role Id is required',
			null,
			400,
		);
	}

	try {
		await User.findOne({ role: id })
			.then((users) => {
				if (users) {
					return helper.response(
						res,
						req.logger,

						false,
						'This role is assigned to users. Please delete those first',
					);
				}
			})
			.catch((error) => {
				req.logger.error(`error encountered: ${error}`);

				return helper.response(
					res,
					req.logger,

					false,
					'Something went wrong',
					null,
					500,
				);
			});

		await Role.findOne({ _id: id })
			.then((role) => {
				if (!role) {
					return helper.response(
						res,
						req.logger,

						false,
						'No role found',
						null,
						500,
					);
				}

				role.deletedAt = new Date();
				role.save();

				return helper.response(
					res,
					req.logger,
					true,
					'Role deleted successfully',
				);
			})
			.catch((error) => {
				req.logger.error(`error encountered: ${error}`);

				return helper.response(
					res,
					req.logger,

					false,
					'Unable to create Role',
					null,
					500,
				);
			});
	} catch (error) {
		req.logger.error(`error encountered: ${error}`);

		return helper.response(
			res,
			req.logger,
			false,
			'Something went wrong!',
			null,
			500,
		);
	}
};

exports.updateRole = async (req, res) => {
	let role_id = req.params.id || '';
	let role = req.body.role || '';
	let permission = req.body.permissions || '';

	if (!role_id || !role || !permission) {
		return helper.response(
			res,
			req.logger,

			false,
			'Bad request: Role id, Role name, Permissions are required',
			null,
			400,
		);
	}

	try {
		let permissions = [];

		if (permission.length === 0) {
			return helper.response(
				res,
				req.logger,

				false,
				'No permissions defined',
				null,
				400,
			);
		}

		await Role.findOne({ _id: role_id })
			.then((res_role) => {
				if (!res_role) {
					return helper.response(
						res,
						req.logger,

						false,
						'Role not found for update',
						null,
						400,
					);
				}

				permission.forEach((item) => {
					let module_included = false;
					let sub_modules = [];

					item.sub_modules?.forEach((element) => {
						if (element.included) {
							if (module_included == false) {
								module_included = true;
							}

							sub_modules.push(element.id);
						}
					});

					if (module_included) {
						permissions.push({
							module: item.id,
							sub_modules,
						});
					}
				});

				res_role.role = helper.getSlug(role);
				res_role.display_name = role;
				res_role.permissions = permissions;
				res_role.save();

				return helper.response(
					res,
					req.logger,
					true,
					'Role update successfully',
				);
			})
			.catch((error) => {
				req.logger.error(`error encountered: ${error}`);

				return helper.response(
					res,
					req.logger,

					false,
					'Unable to update Role',
					null,
					500,
				);
			});
	} catch (error) {
		req.logger.error(`error encountered: ${error}`);

		return helper.response(
			res,
			req.logger,
			false,
			'Something went wrong!',
			null,
			500,
		);
	}
};

exports.getUserInfoById = async (req, res) => {
	let user_id = req.AuthData.id;
	if (!user_id) {
		return helper.response(
			res,
			req.logger,

			false,
			'Bad Request: No user_id provided',
			null,
			400,
		);
	}
	try {
		const user = await User.findOne({ _id: user_id });
		if (user)
			return helper.response(res, req.logger, true, 'User found', user);
	} catch (error) {
		req.logger.error(`error encountered: ${error}`);

		return helper.response(
			res,
			req.logger,
			false,
			'Something went wrong',
			null,
			500,
		);
	}
};

exports.getRoles = async (req, res) => {
	try {
		await Role.find({
			type: 'super-admin',
		}).then((role) => {
			return helper.response(res, req.logger, true, 'Roles found', role);
		});
	} catch (error) {
		req.logger.error(`error encountered: ${error}`);

		return helper.response(
			res,
			req.logger,
			false,
			'Something went wrong',
			null,
			500,
		);
	}
};

exports.addUser = async (req, res) => {
	let name = req.body.name || '';
	let email = req.body.email || '';
	let role = req.body.role || '';

	if (!name || !email || !role) {
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
					email: email,
					type: 'super-admin',
					deletedAt: null,
				},
			},
		]);

		if (check_user.length > 0) {
			return helper.response(
				res,
				req.logger,

				false,
				'User already exists',
				null,
				null,
				500,
			);
		}
		var length = 12,
			charset =
				'@#$&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$&*0123456789abcdefghijklmnopqrstuvwxyz',
			password = '';

		for (var i = 0, n = charset.length; i < length; ++i) {
			password += charset.charAt(Math.floor(Math.random() * n));
		}

		let passwordHashed = await bcrypt.hash(
			password,
			bcrypt.genSaltSync(password_salt_rounds),
		);

		let create_user = await User.create({
			name,
			email,
			role,
			password: passwordHashed,
			type: 'super-admin',
			deletedAt: null,
			is_active: true,
			change_password: true,
		});

		if (create_user) {
			helper.createNotifications(
				'email',
				[create_user.email],
				'master-admin-account-creation',
				{
					'{{sub_admin_name}}': create_user.name,
					'{{master_admin_url}}': process.env.MASTER_ADMIN_WEBSITE,
					'{{sub_admin_email}}': create_user.email,
					'{{sub_admin_password}}': password,
				},
				null,
				'high',
			);
		}

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
			create_user,
		);
	} catch (error) {
		req.logger.error(`error encountered: ${error}`);
		if (e.name === 'ValidationError') {
			const errors = helper.getErrorBody(e);
			return helper.response(
				res,
				req.logger,

				false,
				'Validation Error',
				null,
				errors,
				400,
			);
		}
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

exports.getAllUsers = async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;

	try {
		const all_users = await User.find({
			deletedAt: null,
			type: 'super-admin',
		})
			.populate('role')
			.skip((page - 1) * limit)
			.limit(limit);

		const count = await User.countDocuments({ deletedAt: null });
		const response_data = {
			total_pages: Math.ceil(count / limit),
			total_count: count,
			current_page: page,
			next_page: page * limit < count ? page + 1 : null,
			previous_page: page - 1 > 0 ? page - 1 : null,
			all_users,
		};
		if (all_users) {
			return helper.response(
				res,
				req.logger,

				true,
				'List of all users',
				response_data,
			);
		}
	} catch (error) {
		req.logger.error(`error encountered: ${error}`);

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

exports.editUserRole = async (req, res) => {
	let user_id = req.body.id;
	let role = req.body.currentRole;
	if (!user_id) {
		return helper.response(
			res,
			req.logger,

			false,
			'Bad Request: No user_id provided',
			null,
			400,
		);
	}
	try {
		const user = await User.findOneAndUpdate(
			{
				_id: user_id,
				deletedAt: null,
			},
			{ role },
			{
				new: true,
			},
		);

		return helper.response(
			res,
			req.logger,
			true,
			'User updated successfully.',
			user,
		);
	} catch (e) {
		req.logger.error(`error encountered: ${e}`);

		if (e.name === 'ValidationError') {
			const errors = helper.getErrorBody(e);
			return helper.response(
				res,
				req.logger,

				false,
				'Validation Error',
				null,
				errors,
				400,
			);
		}

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

exports.deleteUser = async (req, res) => {
	let user_id = req.body.id;

	if (!user_id) {
		return helper.response(
			res,
			req.logger,

			false,
			'Bad Request: No user_id provided',
			null,
			400,
		);
	}
	try {
		// TODO: check is_active field usage
		const user = await User.findOneAndUpdate(
			{ _id: user_id },
			{ deletedAt: new Date(), is_active: false },
			{ new: true },
		);

		if (user) {
			helper.createNotifications(
				'email',
				'master-admin-sub-admin-deleted',
				[user.email],
				{
					'{{sub_admin_name}}': user.name,
				},
				null,
				'high',
			);
		}

		return helper.response(
			res,
			req.logger,
			true,
			'User deleted successfully.',
			user,
		);
	} catch (e) {
		req.logger.error(`error encountered: ${e}`);
		if (e.name === 'ValidationError') {
			const errors = helper.getErrorBody(e);
			return helper.response(
				res,
				req.logger,

				false,
				'Validation Error',
				null,
				errors,
				400,
			);
		}
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

exports.suspendUser = async (req, res) => {
	let user_id = req.body.id;
	const { isActive } = req.body; // Assuming you have a field named "isActive" in the request body

	if (!user_id) {
		return helper.response(
			res,
			req.logger,

			false,
			'Bad Request: No user_id provided',
			null,
			400,
		);
	}
	try {
		// TODO: check is_active field usage
		const user = await User.findOneAndUpdate(
			{ _id: user_id, deletedAt: null },
			{ is_active: isActive },
			{ new: true },
		);

		if (!user) {
			return helper.response(
				res,
				req.logger,

				false,
				'User not found or already deleted.',
				null,
				404,
			);
		}

		const message = isActive
			? 'User activated successfully.'
			: 'User deactivated successfully.';

		return helper.response(res, req.logger, true, message, user);
	} catch (e) {
		req.logger.error(`error encountered: ${e}`);

		if (e.name === 'ValidationError') {
			const errors = helper.getErrorBody(e);
			return helper.response(
				res,
				req.logger,

				false,
				'Validation Error',
				null,
				errors,
				400,
			);
		}
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
