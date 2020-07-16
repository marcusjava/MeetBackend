const Validator = require('validator');
const isEmpty = require('./isEmpty');
const isArray = require('./isArray');

module.exports = (data) => {
	let errors = {};

	data.date = !isEmpty(data.date) ? data.date : '';
	data.description = !isEmpty(data.description) ? data.description : '';
	data.participants = !isEmpty(data.participants) ? data.participants : [];

	if (Validator.isEmpty(data.date)) {
		errors = { path: 'date', message: 'Informe a data da audiência' };
	}

	if (!Validator.isLength(data.description, { min: 2, max: 100 })) {
		errors = { path: 'description', message: 'Descrição precisa ser entre 2 e 100 caracteres' };
	}

	if (Validator.isEmpty(data.description)) {
		errors = { path: 'description', message: 'Informe a descrição da audiência' };
	}

	if (isEmpty(data.participants)) {
		errors = { path: 'participants', message: 'Informe ao menos um participante' };
	}

	if (data.participants.length < 2) {
		errors = { path: 'participants', message: 'Selecione ao menos dois participantes' };
	}

	return {
		errors,
		isValid: isEmpty(errors),
	};
};
