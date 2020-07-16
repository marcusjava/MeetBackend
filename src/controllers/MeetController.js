const Meeting = require('../models/Meeting.js');
const meetValidation = require('../validation/meeting.js');

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 * TODO: Verificar se existe
 * audiencia marcada para os participantes no mesmo horario
 */

const save = async (req, res, next) => {
	const { errors, isValid } = meetValidation(req.body);

	if (!isValid) {
		return next({ status: 500, message: errors });
	}
	const { date, description, participants, room_link, observations } = req.body;

	participants.forEach((participant) => {
		Meeting.findOne({ date, participants: { $in: [participant] }, status: 'Agendada' })
			.then((meeting) => {
				if (meeting) {
					const partFound = meeting.participants.filter((item) => item._id == participant);
					return next({
						status: 500,
						message: {
							path: 'participants',
							message: `O participante ${partFound[0].name} já possui audiência nesse horario `,
						},
					});
				}
			})
			.catch((error) => console.log(error));
	});

	try {
		const newMeet = await Meeting.create({
			date,
			description,
			participants,
			room_link,
			observations,
			createdBy: req.user,
		});
		return res.status(201).json(newMeet);
	} catch (error) {
		return next({ status: 400, message: error });
	}
};

const update = async (req, res, next) => {
	const { errors, isValid } = meetValidation(req.body);

	if (!isValid) {
		return next({ status: 500, message: errors });
	}

	const { id } = req.params;
	const { date, description, participants, room_link, observations, status } = req.body;

	const meet = await Meeting.findById(id);

	if (!meet) {
		return next({ status: 404, message: 'Video Audiência não localizada' });
	}

	Meeting.findByIdAndUpdate(
		{ _id: id },
		{ date, description, participants, room_link, observations, status, updatedBy: req.user },
		{ new: true }
	)
		.then((meet) => res.json(meet))
		.catch((error) => next({ status: 500, message: error }));
};

const retrieve = async (req, res, next) => {
	const { id } = req.params;

	const meet = await Meeting.findById(id);

	if (!meet) {
		return next({ status: 404, message: 'Video Audiência não localizada' });
	}

	return res.json(meet);
};

const list = async (req, res, next) => {
	const { start, end, myMeets, status } = req.query;
	const { _id } = req.user;

	let condition = {};

	condition.date = { $gte: new Date().setHours(00, 00, 00) };

	if (start !== undefined && end !== undefined) {
		condition.date = {
			$gte: new Date(new Date(start).setHours(00, 00, 00)),
			$lte: new Date(new Date(end).setHours(23, 59, 59)),
		};
	}

	if (myMeets) {
		condition.participants = { $in: [_id] };
	}

	if (status != undefined) {
		condition.status = status;
	}

	Meeting.find(condition)
		.sort({ date: 1 })
		.limit(200)
		.exec((error, meetings) => {
			if (error) {
				return next({ status: 400, message: { message: error } });
			}
			return res.json(meetings);
		});
};

module.exports = { save, retrieve, update, list };
