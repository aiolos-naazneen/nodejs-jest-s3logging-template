const mongoose = require('mongoose');

module.exports = mongoose.model(
	'User',
	new mongoose.Schema(
		{
			name: {
				type: String,
				required: true,
			},
			email: {
				type: String,
				required: true,
			},
			password: {
				type: String,
				required: true,
			},
			role: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Role',
			},
			access_token: {
				type: String,
				default: null,
			},
			is_active: {
				type: Boolean,
				default: true,
			},
			deletedAt: {
				type: Date,
				default: null,
			},
		},
		{
			timestamps: true,
		},
	),
	'users',
);
