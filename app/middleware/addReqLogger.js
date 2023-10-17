const { v4: uuidv4 } = require('uuid');
const getOrCreateLogger = require('../../log');

module.exports = (extraParams) => {
	return function (req, res, next) {
		let log_id = uuidv4();
		// get logger
		const logger = getOrCreateLogger(extraParams.log_file, log_id);
		// log requiest instance
		logger.info({
			request: {
				route: req.url,
				method: req.method,
				body: req.body,
				params: req.params,
				query: req.query,
				headers: req.headers,
			},
		});
		// attach logger to req
		req.log_id = log_id;
		req.logger = logger;
		next();
	};
};
