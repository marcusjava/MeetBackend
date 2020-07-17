const Local = require('../models/Local');
const validator = require('../validation/local');

const save = async (req, res, next) => {
	const { errors, isValid } = validator(req.body);

	if (!isValid) {
		return next({ status: 400, message: errors });
	}
	const { name, email, address, contact1, contact2, ip } = req.body;

	const local = await Local.findOne({ $or: [{ email }, { name }] });

	if (local) {
		return next({ status: 400, message: { path: 'email', message: 'Já existe um local com esse email ou nome' } });
	}

	try {
		const newLocal = await Local.create({
			name,
			email,
			address,
			contact1,
			contact2,
			ip,
		});
		return res.status(201).json(newLocal);
	} catch (error) {
		return next({ status: 400, message: error });
	}
};

const update = async (req, res, next) => {
	const { id } = req.params;
	const { name, email, address, contact1, contact2, ip } = req.body;
	const local = await Local.findById(id);
	if (!local) {
		return next({ status: 404, message: 'Local não localizado' });
	}
	Local.findByIdAndUpdate({ _id: id }, { name, email, address, contact1, contact2, ip }, { new: true })
		.then((local) => res.json(local))
		.catch((error) => next({ status: 400, message: error }));
};

const retrieve = async (req, res, next) => {
	const { id } = req.params;

	const local = await Local.findById(id);

	if (!local) {
		return next({ status: 404, message: 'Local não localizado' });
	}

	return res.json(local);
};

const list = async (req, res, next) => {
	const { name, email } = req.query;

	let condition = {};

	if (name != undefined) {
		condition.name = { $regex: name, $options: 'i' };
	}
	if (email != undefined) {
		condition.email = { $regex: email, $options: 'i' };
	}
	const list = await Local.find(condition).sort({ createdAt: -1 });
	return res.json(list);
};

module.exports = { save, update, retrieve, list };
