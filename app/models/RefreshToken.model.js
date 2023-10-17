const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const refresh_token_expiration = process.env.REFRESH_TOKEN_EXPIRATION;

const RefreshTokenSchema = new mongoose.Schema(
	{
		token: {
			type: String,
			required: true,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		candidate_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Candidate',
		},
		expiryDate: {
			type: Date,
			defaultValue: null,
		},
	},
	{
		timestamps: true,
	},
);

RefreshTokenSchema.statics.createToken = async function (user) {
	let expiredAt = new Date();

	expiredAt.setSeconds(expiredAt.getSeconds() + refresh_token_expiration);

	let _token = uuidv4();

	let _object = new this({
		token: _token,
		user_id: user._id,
		expiryDate: expiredAt.getTime(),
	});

	console.log(_object);

	let refreshToken = await _object.save();

	return refreshToken.token;
};

RefreshTokenSchema.statics.createCandidateToken = async function (candidate) {
	let expiredAt = new Date();

	expiredAt.setSeconds(expiredAt.getSeconds() + refresh_token_expiration);

	let _token = uuidv4();

	let _object = new this({
		token: _token,
		candidate_id: candidate._id,
		expiryDate: expiredAt.getTime(),
	});

	console.log(_object);

	let refreshToken = await _object.save();

	return refreshToken.token;
};

RefreshTokenSchema.statics.verifyExpiration = (token) => {
	return token.expiryDate.getTime() < new Date().getTime();
};

module.exports = mongoose.model(
	'RefreshToken',
	RefreshTokenSchema,
	'refresh_tokens',
);
