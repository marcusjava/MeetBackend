const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res, next) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		return next({ status: 404, message: { path: 'email', message: 'Usuario não encontrado' } });
	}

	//user inativo
	if (user.status == 'Inativo') {
		return next({ status: 400, message: { path: 'email', message: 'Usuario inativo' } });
	}

	bcrypt
		.compare(password, user.password)
		.then((isMatch) => {
			if (isMatch) {
				const payload = {
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
					local: user.local.name,
					avatar_url:
						process.env.STORAGE_TYPE == 'local'
							? `http://localhost:3001/uploads/${user.avatar}`
							: `https://podobucket.s3.us-east-2.amazonaws.com/${user.avatar}`,
				};

				jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '24h' }, (error, token) => {
					res.json({ success: true, token: `Bearer ${token}` });
				});
			} else {
				return next({ status: 400, message: { path: 'password', message: 'Senha não confere' } });
			}
		})
		.catch((error) => next({ status: 400, message: { path: 'general', message: error } }));
};

const register = async (req, res, next) => {
	const { name, email, contact1, contact2, password, role, local } = req.body;

	const user = await User.findOne({ email });

	if (user && user.email == email) {
		return next({ status: 400, message: { path: 'email', message: 'Já existe um usuario com esse email' } });
	}

	const newUser = new User({
		avatar: typeof req.file === 'undefined' ? 'no-img.png' : req.file.key,
		name,
		email,
		contact1,
		contact2,
		password,
		role,
		local,
	});
	bcrypt.genSalt(10, (error, salt) => {
		bcrypt.hash(newUser.password, salt, (error, hash) => {
			if (error)
				next({
					status: 500,
					message: {
						path: 'password',
						message: 'Ocorreu um erro ao tentar criar o hash da senha do usuario',
					},
					error,
				});

			newUser.password = hash;
			newUser
				.save()
				.then((user) => res.status(201).send(user))
				.catch((error) => {
					if (error.errors.email) {
						return next({ status: 400, message: { path: 'email', message: 'Email já cadastrado' } });
					}
					return next({
						status: 400,
						message: { path: 'general', message: 'Ocorreu um erro ao salvar o usuario' + error },
					});
				});
		});
	});
};

//TODO - Change password
const update = async (req, res, next) => {
	const { id } = req.params;

	const { name, email, contact1, contact2, status, role, local, password } = req.body;

	const user = await User.findById({ _id: id });

	if (!user) {
		return next({ status: 404, message: { path: 'user', message: 'Usuario não encontrado' } });
	}

	const updatedUser = {
		avatar: typeof req.file === 'undefined' ? user.avatar : req.file.key,
		name,
		email,
		contact1,
		contact2,
		role,
		local,
		status,
	};

	if (password) {
		updatedUser.password = password;
		bcrypt.genSalt(10, (error, salt) => {
			bcrypt.hash(updatedUser.password, salt, (error, hash) => {
				if (error)
					next({
						status: 500,
						message: {
							path: 'password',
							message: 'Ocorreu um erro ao tentar criar o hash da senha do usuario',
						},
						error,
					});

				updatedUser.password = hash;
				User.findByIdAndUpdate({ _id: id }, updatedUser, { new: true })
					.then((user) => res.json(user))
					.catch((error) => next({ status: 400, message: error }));
			});
		});
	} else {
		User.findByIdAndUpdate({ _id: id }, updatedUser, { new: true })
			.then((user) => res.json(user))
			.catch((error) => next({ status: 400, message: error }));
	}
};

const changePwd = async (req, res, next) => {
	const { password, password2 } = req.body;
	const { id } = req.params;

	if (password != password2) {
		return next({ status: 400, message: { path: 'password', message: 'Senhas não conferem' } });
	}

	bcrypt.genSalt(10, (error, salt) => {
		bcrypt.hash(password, salt, (error, hash) => {
			if (error) throw error;
			User.findByIdAndUpdate({ _id: id }, { password: hash }, { new: true })
				.then((user) => res.json({ msg: 'Senha atualizada com sucesso' }))
				.catch((error) =>
					next({
						status: 400,
						message: { path: 'password', message: 'Erro ao tentar alterar a senha' },
						error,
					})
				);
		});
	});
};

const getUser = async (req, res, next) => {
	const { id } = req.params;

	const user = await User.findById(id);
	if (!user) {
		return next({ status: 404, message: { path: 'user', message: 'Usuario não localizado' } });
	}

	return res.json(user);
};

const listUsers = async (req, res) => {
	const { name, email } = req.query;

	const condition = {};

	if (name != undefined) {
		condition.name = { $regex: name, $options: 'i' };
	}

	if (email != undefined) {
		condition.email = { $regex: email, $options: 'i' };
	}

	const users = await User.find(condition).sort({ createdAt: -1 });
	return res.json(users);
};

module.exports = { login, register, changePwd, listUsers, update, getUser };
