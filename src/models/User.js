const mongoose = require('mongoose');
const populate = require('mongoose-autopopulate');

const aws = require('aws-sdk');

const s3 = new aws.S3();

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const UserSchema = mongoose.Schema(
	{
		avatar: {
			type: String,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
		},
		name: {
			type: String,
			required: true,
		},
		contact1: { type: String, default: '' },
		contact2: { type: String, default: '' },
		password: {
			type: String,
			required: true,
			select: false,
		},
		role: {
			type: String,
			enum: ['Usuario', 'Administrador'],
			default: 'Usuario',
		},

		local: {
			type: mongoose.Types.ObjectId,
			ref: 'Local',
			autopopulate: true,
			require: true,
		},
		// 0 - Ativo
		// 1 - Inativo
		status: {
			type: String,
			enum: ['Ativo', 'Inativo'],
			default: 'Ativo',
		},
	},
	{
		toJSON: {
			virtuals: true,
		},
		timestamps: true,
	}
);

UserSchema.plugin(populate);

UserSchema.virtual('avatar_url').get(function () {
	return process.env.STORAGE_TYPE == 'local'
		? `http://localhost:3001/uploads/${this.avatar}`
		: `https://meetuploads.s3.us-east-2.amazonaws.com/${this.avatar}`;
});

UserSchema.pre('remove', function () {
	if (process.env.STORAGE_TYPE === 's3') {
		return s3
			.deleteObject({
				Bucket: 'meetuploads',
				Key: this.avatar,
			})
			.promise();
	} else {
		return promisify(fs.unlink)(path.resolve(__dirname, '..', '..', 'uploads', this.avatar));
	}
});

module.exports = mongoose.model('User', UserSchema);
