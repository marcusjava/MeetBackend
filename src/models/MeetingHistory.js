const mongoose = require('mongoose');

const MeetingHistory = new mongoose.Schema({
	t: {
		type: Date,
		default: Date.now(),
	},
	docId: {
		type: mongoose.Types.ObjectId,
		ref: 'Consult',
	},
	o: {
		type: String,
		enum: ['i', 'u', 'r'],
	},
	d: {},
});
module.exports = mongoose.model('meeting_history', MeetingHistory);
