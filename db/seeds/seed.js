const format = require("pg-format");
const db = require("../connection");

const seed = ({ eventsData, usersData, staffData }) => {
  return db
    .query(`DROP TABLE IF EXISTS events, users, staff;`)
    .then(() => {
      return Promise.all([
        db.query(`
                    CREATE TABLE events (
                        event_id SERIAL PRIMARY KEY,
                        title VARCHAR NOT NULL,
                        location VARCHAR NOT NULL,
                        image VARCHAR DEFAULT 'https://i.postimg.cc/xjg6rZ6w/default.jpg',
                        description VARCHAR NOT NULL,
                        date DATE NOT NULL,
                        time TIME NOT NULL
                    );
                `),
        db.query(`
                    CREATE TABLE users (
                        user_id SERIAL PRIMARY KEY,
                        username VARCHAR UNIQUE NOT NULL,
                        email VARCHAR NOT NULL,
                        phone VARCHAR NOT NULL
                    );
                `),
        db.query(`
                    CREATE TABLE staff (
                        staff_id SERIAL PRIMARY KEY,
                        username VARCHAR UNIQUE NOT NULL,
                        email VARCHAR NOT NULL
                    );
                `),
      ]);
    })
    .then(() => {
      const insertPromises = [];

      if (eventsData.length) {
        const insertEventsQuery = format(
          `INSERT INTO events (title, location, image, description, date, time) VALUES %L;`,
          eventsData.map(
            ({ title, location, image, description, date, time }) => [
              title,
              location,
              image,
              description,
              date,
              time,
            ]
          )
        );
        insertPromises.push(db.query(insertEventsQuery));
      }

      if (usersData.length) {
        const insertUsersQuery = format(
          `INSERT INTO users (username, email, phone) VALUES %L;`,
          usersData.map(({ username, email, phone }) => [
            username,
            email,
            phone,
          ])
        );
        insertPromises.push(db.query(insertUsersQuery));
      }

      if (staffData.length) {
        const insertStaffQuery = format(
          `INSERT INTO staff (username, email) VALUES %L;`,
          staffData.map(({ username, email }) => [username, email])
        );
        insertPromises.push(db.query(insertStaffQuery));
      }

      return Promise.all(insertPromises);
    });
};

module.exports = seed;
