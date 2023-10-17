require('dotenv').config();

exports.sms_username = process.env.SMS_USERNAME;
exports.sms_hash = process.env.SMS_HASH;
exports.sms_sender = process.env.SMS_SENDER;
exports.access_token_expiration = process.env.ACCESS_TOKEN_EXPIRATION;
exports.jwt_secret_key = process.env.JWT_SECRET_KEY;
exports.password_salt_rounds = parseInt(process.env.PASSWORD_SALT_ROUNDS) || 10;
exports.default_from_email_address = process.env.DEFAULT_FROM_EMAIL_ADDRESS;
