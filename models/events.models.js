const db = require("../db/connection");
const format = require("pg-format");

exports.selectEvents = () => {
  return db.query(`SELECT * FROM events;`).then((result) => {
    return [result.rows];
  });
};

exports.selectEventById = (event_id) => {
  let query = `SELECT * FROM events WHERE event_id = %L;`;

  query = format(query, event_id);

  return db.query(query).then((result) => {
    if (result.rows.length !== 0) {
      return result.rows[0];
    } else {
      return Promise.reject({ status: 404, msg: "not found" });
    }
  });
};

exports.insertEvent = (event) => {
  const formattedEvent = [
    event.title,
    event.location,
    event.image,
    event.description,
    event.date,
    event.time,
  ];

  const query = format(
    `
    INSERT INTO events(title, location, image, description, date, time)
    VALUES (%L)
    RETURNING *;`,
    formattedEvent
  );

  return db.query(query).then((result) => {
    return result.rows[0];
  });
};

exports.removeEventById = (event_id) => {
  const query = format(
    `DELETE FROM events
    WHERE event_id = %L
    RETURNING *;`,
    event_id
  );

  return db.query(query).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "not found" });
    }
    return result.rows[0];
  });
};

exports.updateEventById = (event_id, eventUpdate) => {
  const fields = Object.keys(eventUpdate);
  const values = Object.values(eventUpdate);

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const query = `
    UPDATE events
    SET ${setClause}
    WHERE event_id = $${fields.length + 1}
    RETURNING *;
  `;

  return db.query(query, [...values, event_id]).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "not found" });
    }
    return result.rows[0];
  });
};
