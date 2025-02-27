const apiRouter = require("express").Router();
const eventsRouter = require("./events-router");

apiRouter.use("/events", eventsRouter);

module.exports = apiRouter;
