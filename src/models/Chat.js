const mongoose = require('mongoose');

const ChatSchema = mongoose.Schema(
	{
		room: {
			type: mongoose.Types.ObjectId,
			ref: 'VideoConferencia',
		},
		user_id: {
			type: mongoose.Types.ObjectId,
			ref: 'User',
		},
		avatar: {
			type: String,
		},
		user: {
			type: String,
			required: true,
		},
		text: {
			type: String,
			required: true,
		},
	},
	{
		toJSON: {
			virtuals: true,
		},
		timestamps: true,
	}
);

module.exports = mongoose.model('Chat', ChatSchema);
