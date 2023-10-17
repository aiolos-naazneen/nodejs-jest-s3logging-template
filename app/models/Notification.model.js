const mongoose = require('mongoose');

module.exports = mongoose.model(
	'Notification',
	new mongoose.Schema(
		{
			channel: {
				type: String,
				required: true,
			},
			sender: {
				type: String,
			},
			recipient: {
				type: String,
				required: true,
			},
			template_id:{
				type: mongoose.Schema.Types.ObjectId,
				ref:"Template",
				required: true,
			},
			replacements: {
				type: mongoose.Schema.Types.Mixed,
				default: {}
			},
			priority:{
				type: String,
				required: true,
			},
			status:{
				type: String,
				required: true,
				default: 'pending',
			},
			attempts: {
				type: Number,
				default: 0,
			},
			attempt_logs:[
				{
					attemptedAt:{
						type: Date,
					},
					attemptRawResponse:{
						type: String,
					}
				}
			],
			deletedAt: {
				type: Date,
				default: null,
			},
		},
		{
			timestamps: true,
		},
	),
	'notifications',
);
