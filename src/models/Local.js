const mongoose = require('mongoose');

const LocalSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			unique: true,
			trim: true,
			match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
		},
		address: {
			street: { type: String },
			neighborhood: { type: String },
			city: { type: String },
			state: { type: String },
			cep: { type: String },
		},
		contact1: { type: String },
		contact2: { type: String },
		ip: { type: String },
	},
	{
		toJSON: {
			virtuals: true,
		},
		timestamps: true,
	}
);

module.exports = mongoose.model('Local', LocalSchema);
