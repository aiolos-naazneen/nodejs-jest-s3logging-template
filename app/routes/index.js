var express = require('express');
var router = express.Router();

const AuthController = require('../controllers/Auth.controller');
const validateToken = require('../middleware/validateToken');

/* GET home page. */
router.get('/', (req, res, next) => {
	return res.send('Backend is up and running :)');
});

// router.get('/notify', (req, res, next) => {
// 	return AuthController.notify(req, res, next);
// });

module.exports = router;
