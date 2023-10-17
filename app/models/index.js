const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;
db.userModel = require('./User.model');
db.userOtpModel = require('./UserOtp.model');
db.roleModel = require('./Role.model');
db.refreshTokenModel = require('./RefreshToken.model');
db.ModuleModel = require('./Module.model');
db.SubModuleModel = require('./SubModule.model');
db.notificationModel = require('./Notification.model');
db.templateModel = require('./Template.model');

module.exports = db;
