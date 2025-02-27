const {
  selectEvents,
  selectEventById,
  insertEvent,
  removeEventById,
  updateEventById,
} = require("../models/events.models");

exports.getEvents = (req, res, next) => {
  selectEvents()
    .then((result) => {
      const events = result[0];

      res.status(200).send({ events });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getEventById = (req, res, next) => {
  const { event_id } = req.params;

  selectEventById(event_id)
    .then((e) => {
      res.status(200).send({ event: e });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postEvent = (req, res, next) => {
  const newEvent = req.body;

  insertEvent(newEvent)
    .then((event) => {
      res.status(201).send({ event });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteEventById = (req, res, next) => {
  const { event_id } = req.params;

  return removeEventById(event_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchEventById = (req, res, next) => {
  const { event_id } = req.params;
  const eventUpdate = req.body;

  return updateEventById(event_id, eventUpdate)
    .then((event) => {
      res.status(200).send({ event });
    })
    .catch((err) => {
      next(err);
    });
};
