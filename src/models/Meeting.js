const mongoose = require('mongoose');
const mongoose_populate = require('mongoose-autopopulate');
const History = require('./MeetingHistory');

const MeetingSchema = mongoose.Schema(
	{
		date: {
			type: Date,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		participants: [
			{
				type: mongoose.Types.ObjectId,
				ref: 'User',
				autopopulate: true,
			},
		],
		room_link: {
			type: String,
		},
		observations: { type: String },
		status: { type: String, enum: ['Agendada', 'Realizada', 'Em andamento', 'Cancelada'], default: 'Agendada' },
		createdBy: {
			type: mongoose.Types.ObjectId,
			ref: 'User',
			autopopulate: true,
		},
		updatedBy: {
			type: mongoose.Types.ObjectId,
			ref: 'User',
			autopopulate: true,
		},
	},
	{
		toJSON: {
			virtuals: true,
		},
		timestamps: true,
	}
);

MeetingSchema.post('save', async (doc) => {
	await History.create({
		o: 'i',
		docId: doc._id,
		d: doc,
	});
});

MeetingSchema.post('findOneAndUpdate', async (doc) => {
	await History.create({
		o: 'u',
		docId: doc._id,
		d: doc,
	});
});

MeetingSchema.plugin(mongoose_populate);

module.exports = mongoose.model('Meeting', MeetingSchema);
