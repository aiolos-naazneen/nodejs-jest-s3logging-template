exports.organization_type_list = [
	'govt_iti',
	'pvt_iti',
	'vocational_training_institute',
	'job_consultancy',
	'ngo_foundation',
	'higher_education_institute',
	'college_under_grad',
	'college_post_grad',
	'mba_institutes',
	'btech_institutes',
	'any_other_training_institute',
];

exports.legal_entity_list = [
	'public_limited_company',
	'private_limited_company',
	'partnership_firm',
	'sole_proprietorship',
	'non_government_organization',
	'limited_liability_partnership',
	null,
];

exports.preferred_collar_list = ['blue_collar', 'grey_collar', 'white_collar'];

exports.fees_criteria_list = ['percentage', 'fixed', null];

exports.kyc_status_list = ['pending', 'validated', 'rejected', null];

exports.bank_account_type_list = ['current', 'savings'];

exports.reseller_kyc_status_list = [
	'incomplete',
	'pending',
	'approved',
	'rejected',
];

exports.reseller_status_list = ['active', 'inactive', 'suspended'];

exports.otp_expires_in_minutes = 10;

exports.sms_url = 'https://control.textlocal.in/api2/send';

exports.channels = ['sms', 'email', 'whatsapp'];

exports.gender_type = ['male', 'female', 'no_criteria', 'transgender'];

exports.job_type = [
	'part_time',
	'full_time',
	'contractual',
	'temporary',
	'internship',
];

exports.work_type = ['wfh', 'wfo', 'hybrid'];

exports.salary_defined_type = ['range', 'fixed'];

exports.salary_type = ['annual', 'monthly'];
