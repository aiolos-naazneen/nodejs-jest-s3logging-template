const db = require('../models');
const { v4: uuidv4 } = require('uuid');
const { notificationModel: Notification, templateModel: Template } = db;
var CronJob = require('cron').CronJob;
const { sendEmail } = require('../email/email');
const moment = require('moment');
const getOrCreateLogger = require('../../log');
var logger = getOrCreateLogger('sendNotification', uuidv4());

exports.job = async () => {
	try {
		var job = new CronJob(
			// process.env.SEND_NOTIFICATION_TIMER,
			'*/2 * * * *',
			async () => {
				logger = getOrCreateLogger('sendNotification', uuidv4());
				try {
					let notification_list = await Notification.aggregate([
						{
							$match: {
								status: 'pending',
								channel: { $ne: 'whatsapp' },
								deletedAt: null,
								attempts: { $lt: 3 },
							},
						},
					]);
					logger.info(
						`notification_list length: ${notification_list.length}`,
					);

					notification_list.forEach(async (item) => {
						req.logger.info(`item.channel: ${item.channel}`);
						switch (item.channel) {
							case 'sms':
								break;
							case 'email':
								let get_template = await Template.findById(
									item.template_id,
								);
								logger.info(
									`template found:${get_template?._id}`,
								);
								let updatedTemplate = get_template.template;

								let placeholders = get_template.placeholders;

								let replacements = item.replacements;

								if (placeholders.length > 0) {
									placeholders.forEach((placeholder) => {
										if (
											replacements.hasOwnProperty(
												placeholder,
											)
										) {
											let replacement =
												replacements[placeholder];

											updatedTemplate =
												updatedTemplate.replace(
													new RegExp(
														placeholder,
														'g',
													),
													replacement,
												);
										}
									});
								}
								logger.info(`template updated`);
								let send_email = await sendEmail(
									process.env.NODE_ENV === 'development'
										? process.env.DEV_TO_EMAIL_ADDRESS
										: item.recipient,
									process.env.DEFAULT_FROM_EMAIL_ADDRESS,
									get_template.subject,
									'',
									updatedTemplate,
								);
								logger.info(`email sent to: ${item.recipient}`);
								let attempt_logs = item.attempt_logs;

								attempt_logs.push({
									attemptedAt: moment(),
									attemptRawResponse:
										JSON.stringify(send_email),
								});

								await Notification.findOneAndUpdate(
									{
										_id: item._id,
									},
									{
										$set: {
											status: send_email?.status
												? 'sent'
												: 'pending',
											attempt_logs,
										},
										$inc: {
											attempts: 1,
										},
									},
								);
								logger.info(`notification updated`);

								break;
							default:
								break;
						}
					});
				} catch (error) {
					logger.error(`error_encountered: ${error}`);
				}
			},
			null,
			true,
			'America/New_York',
		);
		job.start();
		logger.info('Notification job started');
	} catch (error) {
		logger.error(`error_encountered: ${error}`);
	}
};
