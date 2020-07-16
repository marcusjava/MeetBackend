const Chat = require('../models/Chat');

const list = async (req, res, next) => {
	const { id } = req.params;
	const list = await Chat.find({ room: id }).sort({ createdAt: -1 });
	return res.json(list);
};

module.exports = { list };
