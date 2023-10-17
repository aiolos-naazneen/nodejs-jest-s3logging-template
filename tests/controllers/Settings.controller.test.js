const User = require('../../app/models/User.model');
const Role = require('../../app/models/Role.model');
const Module = require('../../app/models/Module.model');
const SubModule = require('../../app/models/SubModule.model');
const settingsController = require('../../app/controllers/Settings.controller');

describe('Settings Controller', () => {
	describe('resetPassword', () => {
		test('Should change the password of the admin', async () => {
			const req = {
				AuthData: { id: '642278e8245caaac205221a7' },
				body: {
					password: 'Admin123',
					newPassword: 'qwerty',
					confirmPassword: 'qwerty',
				},
			};
			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const mockUser = new User({
				_id: req.AuthData.id,
				name: 'Parvez Ahmed',
				email: 'parvez@aiolos.cloud',
				password:
					'$2b$10$5xtfJoTXwyf.Yr/D.UkmVeMnFf3m3x.UK6pgER5YvNvuiv3S8vE/K',
				roles: [],
				createdAt: '2023-03-28T07:05:10.665Z',
				updatedAt: '2023-04-25T10:55:08.521Z',
				is_active: true,
				__v: 0,
				save: jest.fn(),
			});

			const responseData = {
				status: 1,
				statusCode: 200,
				message: 'Password changed successfully',
				data: {
					id: mockUser._id,
					username: mockUser.name,
				},
			};

			const mockPopulate = jest.fn().mockResolvedValue(mockUser);
			User.findOne = jest
				.fn()
				.mockReturnValue({ populate: mockPopulate });

			await settingsController.resetPassword(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(User.findOne).toHaveBeenCalledWith({ _id: req.AuthData.id });
			expect(res.send).toHaveBeenCalledWith(responseData);
		});
		test('Should throw an error saying Password Mismatched', async () => {
			const req = {
				AuthData: { id: '642278e8245caaac205221a7' },
				body: {
					password: 'Admin123',
					newPassword: 'qwerty',
					confirmPassword: 'qwert',
				},
			};
			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const mockUser = new User({
				_id: req.AuthData.id,
				name: 'Parvez Ahmed',
				email: 'parvez@aiolos.cloud',
				password:
					'$2b$10$5xtfJoTXwyf.Yr/D.UkmVeMnFf3m3x.UK6pgER5YvNvuiv3S8vE/K',
				roles: [],
				createdAt: '2023-03-28T07:05:10.665Z',
				updatedAt: '2023-04-25T10:55:08.521Z',
				is_active: true,
				__v: 0,
				save: jest.fn(),
			});

			const responseData = {
				status: 0,
				statusCode: 200,
				message: 'Password Mismatch',
				data: null,
			};

			const mockPopulate = jest.fn().mockResolvedValue(mockUser);
			User.findOne = jest
				.fn()
				.mockReturnValue({ populate: mockPopulate });

			await settingsController.resetPassword(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});
	});

	describe('addUser', () => {
		test('should add a new user', async () => {
			const req = {
				body: {
					name: 'cyril',
					email: 'cyril@aiolos.cloud',
					role: '6447bf4729c70ace4cf9b7a4',
					password: '&2a60Er1E8@P',
					deletedAt: null,
					is_active: false,
				},
			};
			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};
			const expectedUser = {
				name: 'cyril',
				email: 'cyril@aiolos.cloud',
				password: 'W4C3N5ihD*1C',
				role: {
					$oid: '6447c07829c70ace4cf9b7a6',
				},
				is_active: false,
				createdAt: {
					$date: '2023-05-04T06:49:53.048Z',
				},
				updatedAt: {
					$date: '2023-05-04T07:56:49.978Z',
				},
				__v: 0,
				deletedAt: null,
			};
			const responseData = {
				status: 1,
				statusCode: 200,
				message: 'User created successfully',
				data: expectedUser,
				errors: null,
			};
			User.findOne = jest.fn().mockResolvedValueOnce(null);
			User.create = jest.fn().mockResolvedValue(expectedUser);
			await settingsController.addUser(req, res);
			expect(User.findOne).toHaveBeenCalled();
			expect(User.create).toHaveBeenCalledWith(req.body);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});
		test('should raise validation error without required fields', async () => {
			const req = {
				body: {
					name: 'cyril',
					role: '6447bf4729c70ace4cf9b7a4',
					password: '&2a60Er1E8@P',
					deletedAt: null,
					is_active: false,
				},
			};
			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};
			const error = new mongoose.Error.ValidationError();
			error.errors = {
				email: new mongoose.Error.ValidatorError(
					{
						message: 'email is required',
						path: 'email',
					},
					{
						message: 'email is required',
					},
				),
			};
			User.create = jest.fn().mockImplementation(() => {
				throw error;
			});
			try {
				await settingsController.addUser(req, res);
			} catch (err) {
				expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
				expect(create).toThrow(mongoose.Error.ValidationError);
				expect(err.errors.email.message).toBe('email is required');
			}
		});
	});

	describe('deleteUser', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		test('should return success response on deletion', async () => {
			// Arrange
			const req = { body: { id: '64535f4a3984a1450db92b4a' } };
			const user = {
				_id: '64535f4a3984a1450db92b4a',
				deletedAt: now,
			};
			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};
			const responseData = {
				status: 1,
				statusCode: 200,
				message: 'User deleted successfully.',
				data: {
					_id: '64535f4a3984a1450db92b4a',
					deletedAt: now,
				},
				errors: null,
			};
			User.findOneAndUpdate = jest.fn().mockResolvedValue(user);
			// Act
			await settingsController.deleteUser(req, res);
			// Assert
			expect(User.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: req.body.id },
				{ deletedAt: expect.any(Date) },
				{ new: true },
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});
		test('should return error response for server error', async () => {
			// Arrange
			const req = { body: { id: '6453670fb0c7e369eba4a50e' } };
			const user = {
				_id: '6453670fb0c7e369eba4a50e',
				deletedAt: new Date(),
			};
			const res = {
				json: jest.fn(),
				status: jest.fn(),
				send: jest.fn(),
			};
			res.status.mockReturnValue(res);
			const someError = new Error();
			const responseData = {
				status: 0,
				statusCode: 500,
				message: 'Something went wrong!',
				data: null,
				errors: null,
			};
			User.findOneAndUpdate.mockRejectedValueOnce(someError);
			// Act
			await settingsController.deleteUser(req, res);
			// Assert
			expect(User.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: req.body.id },
				{ deletedAt: expect.any(Date) },
				{ new: true },
			);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});
	});

	describe('editUser', () => {
		test('should update the user', async () => {
			const req = {
				body: {
					id: '64534c1d5f0adf76e1c7a606',
					role: '6447bf4729c70ace4cf9b7a4',
				},
			};
			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};
			const expectedUser = {
				_id: '64534c1d5f0adf76e1c7a606',
				name: 'Parvez Ahmed',
				email: 'parvez@aiolos.cloud',
				password:
					'$2b$10$5xwtHqVPXeNwgOvDD129pued9I5xmnpucDqk.ud0CojDoax0TLog.',
				role: '6447c0a329c70ace4cf9b7a7',
				createdAt: '2023-03-28T07:05:10.665Z',
				updatedAt: '2023-05-04T10:49:41.868Z',
				__v: 0,
				is_active: true,
				deletedAt: null,
			};
			const responseData = {
				status: 1,
				statusCode: 200,
				message: 'User updated successfully.',
				data: expectedUser,
				errors: null,
			};
			User.findOneAndUpdate = jest.fn().mockReturnValue(expectedUser);
			await settingsController.editUserRole(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(User.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: req.body.id },
				req.body,
				{ new: true },
			);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});
		test('should raise validation error on incorrect fields', async () => {
			const req = {
				body: {},
			};
			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};
			const error = new mongoose.Error.CastError();
			User.findOneAndUpdate = jest.fn().mockImplementation(() => {
				throw error;
			});
			try {
				await settingsController.editUserRole(req, res);
			} catch (err) {
				expect(err).toBeInstanceOf(mongoose.Error.CastError);
				expect(findOneAndUpdate).toThrow(mongoose.Error.CastError);
			}
		});
	});

	describe('findUserById', () => {
		test('should get the user info', async () => {
			const req = {
				AuthData: { id: '64535f4a3984a1450db92b4a' },
			};
			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};
			const expectedUser = {
				_id: req.AuthData.id,
				name: 'Parvez Ahmed',
				email: 'parvez@aiolos.cloud',
				password:
					'$2b$10$5xwtHqVPXeNwgOvDD129pued9I5xmnpucDqk.ud0CojDoax0TLog.',
				role: {
					_id: '6447c0a329c70ace4cf9b7a7',
					type: 'reseller-admin',
					display_name: 'Reseller Admin',
				},
				createdAt: '2023-03-28T07:05:10.665Z',
				updatedAt: '2023-05-04T10:49:41.868Z',
				__v: 0,
				is_active: true,
				deletedAt: null,
			};
			const responseData = {
				status: 1,
				statusCode: 200,
				message: 'User found',
				data: expectedUser,
				errors: null,
			};
			User.findOne = jest.fn().mockReturnValue(expectedUser);
			await settingsController.getUserInfoById(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(User.findOne).toHaveBeenCalledWith({ _id: req.AuthData.id });
			expect(res.send).toHaveBeenCalledWith(responseData);
		});
	});

	describe('getAllUsers', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		it('should return all users', async () => {
			const mockUsers = [
				{
					_id: '64534c1d5f0adf76e1c7a606',
					name: 'Parvez Ahmed',
					email: 'parvez@aiolos.cloud',
					password:
						'$2b$10$5xwtHqVPXeNwgOvDD129pued9I5xmnpucDqk.ud0CojDoax0TLog.',
					role: {
						_id: '6447c0a329c70ace4cf9b7a7',
						type: 'reseller-admin',
						display_name: 'Reseller Admin',
					},
					createdAt: '2023-03-28T07:05:10.665Z',
					updatedAt: '2023-05-04T10:49:41.868Z',
					__v: 0,
					is_active: true,
					deletedAt: null,
				},
				{
					_id: '64535f4a3984a1450db92b4a',
					name: 'Amin',
					email: 'amin@aiolos.cloud',
					password: '&2a60Er1E8@P',
					role: {
						_id: '6447bf4729c70ace4cf9b7a4',
						type: 'super-admin',
						display_name: 'Super Admin',
					},
					is_active: false,
					createdAt: '2023-05-04T07:31:22.165Z',
					updatedAt: '2023-05-04T07:57:10.827Z',
					__v: 0,
					deletedAt: null,
				},
			];
			User.find = jest.fn().mockImplementation(() => ({
				skip: jest.fn().mockImplementation(() => ({
					limit: jest.fn().mockResolvedValueOnce(mockUsers),
				})),
			}));
			User.countDocuments = jest.fn().mockResolvedValueOnce(2);

			const req = { query: { page: 1, limit: 10 } };
			const res = {
				json: jest.fn(),
				status: jest.fn(),
				send: jest.fn(),
			};
			res.status.mockReturnValue(res);

			const responseData = {
				status: 1,
				statusCode: 200,
				message: 'List of all users',
				all_users: {
					total_pages: 1,
					total_count: 2,
					current_page: 1,
					next_page: null,
					previous_page: null,
					all_users: mockUsers,
				},
				errors: null,
			};
			await settingsController.getAllUsers(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});

		it('should return an error if something goes wrong', async () => {
			User.find = jest.fn().mockImplementation(() => ({
				skip: jest.fn().mockImplementation(() => ({
					limit: jest.fn().mockResolvedValueOnce(mockUser),
				})),
			}));
			User.countDocuments = jest.fn().mockResolvedValueOnce(2);

			const req = { query: { page: 1, limit: 10 } };
			const res = {
				json: jest.fn(),
				status: jest.fn(),
				send: jest.fn(),
			};

			res.status.mockReturnValue(res);
			const responseData = {
				status: 0,
				statusCode: 500,
				message: 'Something went wrong',
				data: null,
				errors: null,
			};
			try {
				await settingsController.getAllUsers(req, res);
			} catch (err) {
				console.log('cc');
			}
			expect(res.send).toHaveBeenCalledWith(responseData);
			expect(res.status).toHaveBeenCalledWith(500);
		});
	});

	describe('sendEmailToUser', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		test('should send email to the user', async () => {
			const req = {
				body: {
					email: 'cyril@aiolos.cloud',
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const responseData = {
				status: 1,
				statusCode: 200,
				message: 'Email sent successfully',
				data: null,
				errors: null,
			};
			User.findOne = jest.fn().mockReturnValue(req.body.email);
			await settingsController.sendEmailToUser(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});
		test('should raise validation error on incorrect fields', async () => {
			const req = {
				body: {},
			};
			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};
			const error = new mongoose.Error.CastError();
			User.findOne = jest.fn().mockImplementation(() => {
				throw error;
			});
			try {
				await settingsController.sendEmailToUser(req, res);
			} catch (err) {
				expect(err).toBeInstanceOf(mongoose.Error.CastError);
				expect(findOne).toThrow(mongoose.Error.CastError);
			}
		});
	});

	describe('getModules', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should return modules when the type is specified', async () => {
			const req = {
				query: {
					type: 'super-admin',
				},
			};

			const modules = [
				{
					_id: 1,
					module_name: 'Job Inventory',
					sub_modules: [],
					is_active: true,
				},
				{
					_id: 2,
					module_name: 'Admin Settings',
					sub_modules: [],
					is_active: true,
				},
			];

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const responseData = {
				status: 1,
				statusCode: 200,
				message: 'Modules found',
				data: modules,
				errors: null,
			};

			Module.find = jest.fn().mockImplementation(() => {
				return { populate: jest.fn().mockResolvedValue(modules) };
			});

			await settingsController.getModules(req, res);
			expect(Module.find).toHaveBeenCalledWith({ type: req.query.type });
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});

		it('should return error when the type is not specified', async () => {
			const req = {
				query: {
					type: '',
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const responseData = {
				status: 0,
				statusCode: 400,
				message: 'Bad request: Type should be specified',
				data: null,
				errors: null,
			};

			await settingsController.getModules(req, res);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});

		it('should return error when modules are not defined', async () => {
			const req = {
				query: {
					type: 'super-admin',
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const responseData = {
				status: 0,
				statusCode: 403,
				message: 'No module defined for this role',
				data: null,
				errors: null,
			};

			Module.find = jest.fn().mockImplementation(() => {
				return { populate: jest.fn().mockResolvedValue(null) };
			});

			await settingsController.getModules(req, res);
			expect(Module.find).toHaveBeenCalledWith({ type: req.query.type });
			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});

		it('should return 500 error when an exception occurs', async () => {
			const req = {
				query: {
					type: 'super-admin',
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const responseData = {
				status: 0,
				statusCode: 500,
				message: 'Something went wrong!',
				data: null,
				errors: null,
			};

			Module.find = jest.fn().mockImplementation(() => {
				return {
					populate: jest
						.fn()
						.mockRejectedValue(new Error('Smeothing')),
				};
			});

			await settingsController.getModules(req, res);
			expect(Module.find).toHaveBeenCalledWith({ type: req.query.type });
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});
	});

	describe('addRole', () => {
		it('should create a role successfully', async () => {
			const req = {
				body: {
					role: 'admin',
					permissions: [
						{
							id: 'module1',
							sub_modules: [
								{ id: 'submodule1', included: true },
								{ id: 'submodule2', included: false },
							],
						},
						{
							id: 'module2',
							sub_modules: [
								{ id: 'submodule3', included: true },
								{ id: 'submodule4', included: true },
							],
						},
					],
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const responseData = {
				status: 1,
				statusCode: 200,
				message: 'Role created successfully',
				data: null,
				errors: null,
			};

			Role.create = jest.fn().mockResolvedValue(req.body);

			await settingsController.addRole(req, res);

			expect(Role.create).toHaveBeenCalledWith({
				type: 'super-admin',
				role: 'admin',
				display_name: 'admin',
				permissions: [
					{
						module: 'module1',
						sub_modules: ['submodule1'],
					},
					{
						module: 'module2',
						sub_modules: ['submodule3', 'submodule4'],
					},
				],
			});

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});

		it('should handle bad request when role and permissions are missing', async () => {
			const req = {
				body: {},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const responseData = {
				status: 0,
				statusCode: 400,
				message: 'Bad request: Role and Permission are required',
				data: null,
				errors: null,
			};

			Role.create = jest.fn().mockResolvedValue(req.body);

			await settingsController.addRole(req, res);

			expect(Role.create).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});

		it('should handle bad request when no permissions are defined', async () => {
			const req = {
				body: {
					role: 'admin',
					permissions: [],
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const responseData = {
				status: 0,
				statusCode: 400,
				message: 'No permissions defined',
				data: null,
				errors: null,
			};

			Role.create = jest.fn().mockResolvedValue(req.body);

			await settingsController.addRole(req, res);

			expect(Role.create).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});

		it('should handle internal server error', async () => {
			const req = {
				body: {
					role: 'admin',
					permissions: [
						{
							id: 'module1',
							sub_modules: [{ id: 'submodule1', included: true }],
						},
					],
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const responseData = {
				status: 0,
				statusCode: 500,
				message: 'Unable to create Role',
				data: null,
				errors: null,
			};

			// Mock an error when Role.create is called
			Role.create = jest
				.fn()
				.mockRejectedValue(new Error('Database error'));

			await settingsController.addRole(req, res);

			expect(Role.create).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});
	});

	describe('getRoleList', () => {
		Role.aggregate = jest.fn();

		it('should return a list of roles when the type is specified', async () => {
			const req = {
				query: {
					type: 'super-admin',
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const roles = [
				{
					_id: 1,
					type: 'super-admin',
					role: 'admin',
					display_name: 'Admin',
					permissions: [
						{
							module: {
								_id: 1,
								module_name: 'Module 1',
							},
							sub_modules: ['submodule1', 'submodule2'],
						},
						{
							module: {
								_id: 2,
								module_name: 'Module 2',
							},
							sub_modules: ['submodule3'],
						},
					],
				},
			];

			const responseData = {
				status: 1,
				statusCode: 200,
				message: 'Roles found',
				data: roles,
				errors: null,
			};

			// Mock the Role.aggregate method
			Role.aggregate.mockResolvedValue(roles);

			await settingsController.getRoleList(req, res);

			expect(Role.aggregate).toHaveBeenCalledWith([
				{
					$match: {
						type: 'super-admin',
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
			]);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});

		it('should handle bad request when type is missing', async () => {
			const req = {
				query: {},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const responseData = {
				status: 0,
				statusCode: 400,
				message: 'Bad request: Type are required',
				data: null,
				errors: null,
			};

			await settingsController.getRoleList(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});

		it('should handle internal server error', async () => {
			const req = {
				query: {
					type: 'super-admin',
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const responseData = {
				status: 0,
				statusCode: 500,
				message: 'Unable to create Role',
				data: null,
				errors: null,
			};

			// Mock an error when Role.aggregate is called
			Role.aggregate.mockRejectedValue(new Error('Database error'));

			await settingsController.getRoleList(req, res);

			expect(Role.aggregate).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});
	});

	describe('getRoleDetails', () => {
		Role.aggregate = jest.fn();

		it('should return role details when a valid role ID is provided', async () => {
			const req = {
				params: {
					id: '12345',
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const role = {
				_id: '12345',
				display_name: 'Admin',
				permissions: [
					{
						module: {
							_id: '67890',
							type: 'super-admin',
							module_name: 'Module 1',
						},
						sub_modules: ['submodule1', 'submodule2'],
					},
				],
			};

			const responseData = {
				status: 1,
				statusCode: 200,
				message: 'Role details',
				data: role,
				errors: null,
			};

			// Mock the Role.aggregate method
			Role.aggregate.mockResolvedValue(role);

			await settingsController.getRoleDetails(req, res);

			expect(Role.aggregate).toHaveBeenCalledWith([
				{
					$match: {
						_id: expect.any(Object),
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
			]);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});

		it('should handle bad request when role ID is missing', async () => {
			const req = {
				params: {},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const responseData = {
				status: 0,
				statusCode: 400,
				message: 'Bad request: Role Id is required',
				data: null,
				errors: null,
			};

			await settingsController.getRoleDetails(req, res);

			// expect(Role.aggregate).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});

		it('should handle role not found', async () => {
			const req = {
				params: {
					id: '12345',
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const responseData = {
				status: 0,
				statusCode: 200,
				message: 'Role not found',
				data: null,
				errors: null,
			};

			// Mock an empty result when Role.aggregate is called
			Role.aggregate.mockResolvedValue([]);

			await settingsController.getRoleDetails(req, res);

			expect(Role.aggregate).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});

		it('should handle internal server error', async () => {
			const req = {
				params: {
					id: '12345',
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			const responseData = {
				status: 0,
				statusCode: 500,
				message: 'Unable to fetch Role details',
				data: null,
				errors: null,
			};

			// Mock an error when Role.aggregate is called
			Role.aggregate.mockRejectedValue(new Error('Database error'));

			await settingsController.getRoleDetails(req, res);

			expect(Role.aggregate).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.send).toHaveBeenCalledWith(responseData);
		});
	});

	describe('deleteRole', () => {
		// Mock the User.findOne and Role.findOne methods
		User.findOne = jest.fn();
		Role.findOne = jest.fn();
		Role.prototype.save = jest.fn();
		it('should delete the role when a valid role ID is provided and there are no users assigned to it', async () => {
			const req = {
				body: {
					id: '12345',
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			// Mock the User.findOne method to return null (no users assigned to the role)
			User.findOne.mockResolvedValue(null);

			// Mock the Role.findOne method to return the role object
			const role = {
				_id: '12345',
				deletedAt: null,
				save: jest.fn(),
			};
			Role.findOne.mockResolvedValue(role);

			await settingsController.deleteRole(req, res);

			expect(User.findOne).toHaveBeenCalledWith({ role: '12345' });
			expect(Role.findOne).toHaveBeenCalledWith({ _id: '12345' });
			expect(role.deletedAt).toEqual(expect.any(Date));
			expect(role.save).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith({
				status: true,
				message: 'Role deleted successfully',
				data: null,
			});
		});

		it('should handle bad request when role ID is missing', async () => {
			const req = {
				body: {},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			await settingsController.deleteRole(req, res);

			expect(User.findOne).not.toHaveBeenCalled();
			expect(Role.findOne).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith({
				status: false,
				message: 'Bad request: Role Id is required',
				data: null,
			});
		});

		it('should handle role with assigned users', async () => {
			const req = {
				body: {
					id: '12345',
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			// Mock the User.findOne method to return a user object
			const user = {
				_id: '67890',
				name: 'John Doe',
				role: '12345',
			};
			User.findOne.mockResolvedValue(user);

			await settingsController.deleteRole(req, res);

			expect(User.findOne).toHaveBeenCalledWith({ role: '12345' });
			expect(Role.findOne).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith({
				status: false,
				message:
					'This role is assigned to users. Please delete those first',
				data: null,
			});
		});

		it('should handle role not found', async () => {
			const req = {
				body: {
					id: '12345',
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			// Mock the User.findOne method to return null
			User.findOne.mockResolvedValue(null);

			// Mock the Role.findOne method to return null (role not found)
			Role.findOne.mockResolvedValue(null);

			await settingsController.deleteRole(req, res);

			expect(User.findOne).toHaveBeenCalledWith({ role: '12345' });
			expect(Role.findOne).toHaveBeenCalledWith({ _id: '12345' });
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.send).toHaveBeenCalledWith({
				status: false,
				message: 'No role found',
				data: null,
			});
		});

		it('should handle database error', async () => {
			const req = {
				body: {
					id: '12345',
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			// Mock the User.findOne method to throw an error
			User.findOne.mockRejectedValue(new Error('Database error'));

			await settingsController.deleteRole(req, res);

			expect(User.findOne).toHaveBeenCalledWith({ role: '12345' });
			expect(Role.findOne).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.send).toHaveBeenCalledWith({
				status: false,
				message: 'Something went wrong',
				data: null,
			});
		});

		it('should handle error during role deletion', async () => {
			const req = {
				body: {
					id: '12345',
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			// Mock the User.findOne method to return null (no users assigned to the role)
			User.findOne.mockResolvedValue(null);

			// Mock the Role.findOne method to return the role object
			const role = {
				_id: '12345',
				deletedAt: null,
				save: jest.fn().mockRejectedValue(new Error('Database error')),
			};
			Role.findOne.mockResolvedValue(role);

			await settingsController.deleteRole(req, res);

			expect(User.findOne).toHaveBeenCalledWith({ role: '12345' });
			expect(Role.findOne).toHaveBeenCalledWith({ _id: '12345' });
			expect(role.deletedAt).toEqual(null);
			expect(role.save).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.send).toHaveBeenCalledWith({
				status: false,
				message: 'Unable to create Role',
				data: null,
			});
		});
	});

	describe('updateRole', () => {
		// Mock the Role.findOne and Role.prototype.save methods
		Role.findOne = jest.fn();
		Role.prototype.save = jest.fn();
		it('should update the role when valid role ID, role name, and permissions are provided', async () => {
			const req = {
				params: {
					id: '12345',
				},
				body: {
					role: 'Admin',
					permissions: [
						{
							id: '67890',
							sub_modules: [
								{
									id: 'abc123',
									included: true,
								},
								{
									id: 'def456',
									included: false,
								},
							],
						},
					],
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			// Mock the Role.findOne method to return the role object
			const role = {
				_id: '12345',
				role: 'admin',
				display_name: 'Admin',
				permissions: [],
				save: jest.fn(),
			};
			Role.findOne.mockResolvedValue(role);

			await settingsController.updateRole(req, res);

			expect(Role.findOne).toHaveBeenCalledWith({ _id: '12345' });
			expect(role.role).toBe('admin');
			expect(role.display_name).toBe('Admin');
			expect(role.permissions).toEqual([
				{
					module: '67890',
					sub_modules: ['abc123'],
				},
			]);
			expect(role.save).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith({
				status: true,
				message: 'Role update successfully',
				data: null,
			});
		});

		it('should handle bad request when role ID is missing', async () => {
			const req = {
				params: {},
				body: {
					role: 'Admin',
					permissions: [
						{
							id: '67890',
							sub_modules: [
								{
									id: 'abc123',
									included: true,
								},
							],
						},
					],
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			await settingsController.updateRole(req, res);

			expect(Role.findOne).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith({
				status: false,
				message:
					'Bad request: Role id, Role name, Permissions are required',
				data: null,
			});
		});

		it('should handle role not found', async () => {
			const req = {
				params: {
					id: '12345',
				},
				body: {
					role: 'Admin',
					permissions: [
						{
							id: '67890',
							sub_modules: [
								{
									id: 'abc123',
									included: true,
								},
							],
						},
					],
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			// Mock the Role.findOne method to return null (role not found)
			Role.findOne.mockResolvedValue(null);

			await settingsController.updateRole(req, res);

			expect(Role.findOne).toHaveBeenCalledWith({ _id: '12345' });
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith({
				status: false,
				message: 'Role not found for update',
				data: null,
			});
		});

		it('should handle no permissions defined', async () => {
			const req = {
				params: {
					id: '12345',
				},
				body: {
					role: 'Admin',
					permissions: [],
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			// Mock the Role.findOne method to return the role object
			const role = {
				_id: '12345',
				role: 'admin',
				display_name: 'Admin',
				permissions: [],
				save: jest.fn(),
			};
			Role.findOne.mockResolvedValue(role);

			await settingsController.updateRole(req, res);

			expect(Role.findOne).toHaveBeenCalledWith({ _id: '12345' });
			expect(role.role).toBe('admin');
			expect(role.display_name).toBe('Admin');
			expect(role.permissions).toEqual([]);
			expect(role.save).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith({
				status: false,
				message: 'No permissions defined',
				data: null,
			});
		});

		it('should handle database error', async () => {
			const req = {
				params: {
					id: '12345',
				},
				body: {
					role: 'Admin',
					permissions: [
						{
							id: '67890',
							sub_modules: [
								{
									id: 'abc123',
									included: true,
								},
							],
						},
					],
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			// Mock the Role.findOne method to throw an error
			Role.findOne.mockRejectedValue(new Error('Database error'));

			await settingsController.updateRole(req, res);

			expect(Role.findOne).toHaveBeenCalledWith({ _id: '12345' });
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.send).toHaveBeenCalledWith({
				status: false,
				message: 'Unable to update Role',
				data: null,
			});
		});

		it('should handle error during role update', async () => {
			const req = {
				params: {
					id: '12345',
				},
				body: {
					role: 'Admin',
					permissions: [
						{
							id: '67890',
							sub_modules: [
								{
									id: 'abc123',
									included: true,
								},
							],
						},
					],
				},
			};

			const res = {
				status: jest.fn().mockReturnThis(),
				send: jest.fn(),
			};

			// Mock the Role.findOne method to return the role object
			const role = {
				_id: '12345',
				role: 'admin',
				display_name: 'Admin',
				permissions: [],
				save: jest.fn().mockRejectedValue(new Error('Database error')),
			};
			Role.findOne.mockResolvedValue(role);

			await settingsController.updateRole(req, res);

			expect(Role.findOne).toHaveBeenCalledWith({ _id: '12345' });
			expect(role.role).toBe('admin');
			expect(role.display_name).toBe('Admin');
			expect(role.permissions).toEqual([
				{
					module: '67890',
					sub_modules: ['abc123'],
				},
			]);
			expect(role.save).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.send).toHaveBeenCalledWith({
				status: false,
				message: 'Unable to update Role',
				data: null,
			});
		});
	});
});
