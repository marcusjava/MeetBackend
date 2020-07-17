const Validator = require('validator');
const isEmpty = require('./isEmpty');
const isArray = require('./isArray');

module.exports = (data) => {
	let errors = {};

	data.name = !isEmpty(data.name) ? data.name : '';
	data.email = !isEmpty(data.email) ? data.email : '';
	data.address.street = !isEmpty(data.address.street) ? data.address.street : '';
	data.address.neighborhood = !isEmpty(data.address.neighborhood) ? data.address.neighborhood : '';
	data.address.city = !isEmpty(data.address.city) ? data.address.city : '';
	data.address.state = !isEmpty(data.address.state) ? data.address.state : '';
	data.address.cep = !isEmpty(data.address.cep) ? data.address.cep : '';
	data.contact1 = !isEmpty(data.contact1) ? data.contact1 : '';
	data.contact2 = !isEmpty(data.contact2) ? data.contact2 : '';
	data.ip = !isEmpty(data.ip) ? data.ip : '';

	if (Validator.isEmpty(data.name)) {
		errors = { path: 'name', message: 'Informe o nome do local' };
	}

	return {
		errors,
		isValid: isEmpty(errors),
	};
};
