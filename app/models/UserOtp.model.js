const mongoose = require('mongoose');

const UserOtpSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectID,
			required: true,
			ref: 'User',
		},
		email: {
			type: String,
			required: true,
		},
		otp: {
			type: Number,
			allowNull: true,
			default: null,
		},
		otp_valid_till: {
			type: Date,
			allowNull: true,
			default: null,
		},
		used: {
			type: Boolean,
			default: false,
		},
		is_valid: {
			type: Boolean,
			default: true,
		},
		usedAt: {
			type: Date,
			default: null,
		},
		deletedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	},
);

const UserOtpModel =
	mongoose.models.UserOtp ||
	mongoose.model('UserOtp', UserOtpSchema, 'user_otp');
module.exports = UserOtpModel;
