module.exports = {
	isAdmin: (req, res, next) => {
		if (req.user.status === 'Administrador') {
			return next();
		} else {
			return next({ status: 401, message: { path: 'user', message: 'Não autorizado' } });
		}
	},
};
