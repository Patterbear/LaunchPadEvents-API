const format = require("pg-format");
const db = require("../connection");

const seed = ({ eventsData }) => {
  return db
    .query(`DROP TABLE IF EXISTS events;`)
    .then(() => {
      return db.query(`
        CREATE TABLE events (
          event_id SERIAL PRIMARY KEY,
          title VARCHAR NOT NULL,
          location VARCHAR NOT NULL,
          image VARCHAR DEFAULT 'https://i.postimg.cc/xjg6rZ6w/default.jpg',
          description VARCHAR NOT NULL,
          date DATE NOT NULL,
          time TIME NOT NULL,
          address VARCHAR NOT NULL
        );
      `);
    })
    .then(() => {
      if (eventsData.length) {
        const insertEventsQuery = format(
          `INSERT INTO events (title, location, image, description, date, time, address) VALUES %L;`,
          eventsData.map(
            ({ title, location, image, description, date, time, address }) => [
              title,
              location,
              image,
              description,
              date,
              time,
              address,
            ]
          )
        );
        return db.query(insertEventsQuery);
      }
    });
};

module.exports = seed;
