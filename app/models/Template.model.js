const mongoose = require('mongoose');

module.exports = mongoose.model(
	'Template',
	new mongoose.Schema(
		{
			type: {
				type: String,
				required: true,
			},
			slug: {
				type: String,
			},
			subject: {
				type: String,
				required: function () {
					return this.type === 'email';
				},
			},
			template: {
				type: String,
				required: true,
			},
			placeholders:{
				type: [String],
				default: [],
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
	'templates',
);
