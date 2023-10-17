var express = require('express');
var router = express.Router();
const AuthController = require('../controllers/Auth.controller');
const validateToken = require('../middleware/validateToken');

router.post('/login', (req, res, next) => {
	return AuthController.login(req, res, next);
});

router.post('/get-access-token', (req, res, next) => {
	return AuthController.getAccessToken(req, res, next);
});

router.post('/send-reset-password-email', (req, res, next) => {
	return AuthController.sendResetPasswordEmail(req, res, next);
});

router.post('/verify-otp', (req, res, next) => {
	return AuthController.verifyOtp(req, res, next);
});

router.post('/change-password', (req, res, next) => {
	return AuthController.changePassword(req, res, next);
});

router.post('/signup', (req, res, next) => {
	return AuthController.signUp(req, res, next);
});

router.post('/logout', validateToken, (req, res, next) => {
	return AuthController.logout(req, res, next);
});

module.exports = router;
