var express = require('express');
var router = express.Router();
const validateToken = require('../middleware/validateToken');
const SettingsController = require('../controllers/Settings.controller');

/* POST reset password */
router.post('/reset-password', validateToken, function (req, res, next) {
	return SettingsController.resetPassword(req, res, next);
});

/* GET users listing. */
router.get('/get-modules', validateToken, function (req, res, next) {
	return SettingsController.getModules(req, res, next);
});

router.post('/add-role', validateToken, function (req, res, next) {
	return SettingsController.addRole(req, res, next);
});

router.get('/get-role-list', validateToken, function (req, res, next) {
	return SettingsController.getRoleList(req, res, next);
});

router.get('/get-role-details/:id', validateToken, function (req, res, next) {
	return SettingsController.getRoleDetails(req, res, next);
});

router.post('/delete-role', validateToken, function (req, res, next) {
	return SettingsController.deleteRole(req, res, next);
});

router.put('/update-role/:id', validateToken, function (req, res, next) {
	return SettingsController.updateRole(req, res, next);
});

/* POST add user */
router.post('/add-user', function (req, res, next) {
	return SettingsController.addUser(req, res, next);
});

/* POST add user */
router.post('/send-email-user', validateToken, function (req, res, next) {
	return SettingsController.sendEmailToUser(req, res, next);
});

/* POST delete user Role */
router.post('/delete-user', validateToken, function (req, res, next) {
	return SettingsController.deleteUser(req, res, next);
});

/* GET logged in user data */
router.get('/get-user-info', validateToken, function (req, res, next) {
	return SettingsController.getUserInfoById(req, res, next);
});

/* GET all roles */
router.get('/get-roles', function (req, res, next) {
	return SettingsController.getRoles(req, res, next);
});

/* GET all Users */
router.get('/get-all-users', validateToken, function (req, res, next) {
	return SettingsController.getAllUsers(req, res, next);
});

/* PATCH edit user Role */
router.patch('/edit-user-role', validateToken, function (req, res, next) {
	return SettingsController.editUserRole(req, res, next);
});

/* POST suspend user Role */
router.post('/suspend-user', validateToken, function (req, res, next) {
	return SettingsController.suspendUser(req, res, next);
});

module.exports = router;
