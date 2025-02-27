const testData = require("../db/data/test-data/index");
const app = require("../app");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const request = require("supertest");

beforeEach(() => seed(testData));

afterAll(() => {
  return db.end();
});

describe("GET /api/events", () => {
  test("returns array of event objects with correct properties", () => {
    return request(app)
      .get("/api/events")
      .expect(200)
      .then((response) => {
        const events = response.body.events;

        expect(Array.isArray(events)).toBe(true);

        for (event of events) {
          expect(event).toMatchObject({
            title: expect.any(String),
            location: expect.any(String),
            image: expect.any(String),
            description: expect.any(String),
            date: expect.any(String),
            time: expect.any(String),
          });

          // checks date and time are valid
          expect(new Date(event.date).getTime()).toBeGreaterThan(0);
          expect(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(event.time)).toBe(
            true
          );
        }
      });
  });
});

describe("GET /api/events/:event_id", () => {
  test("returns correct event object with correct properties", () => {
    return request(app)
      .get("/api/events/1")
      .expect(200)
      .then((response) => {
        const event = response.body.event;

        expect(typeof event).toBe("object");

        expect(event).toMatchObject({
          event_id: 1,
          title: expect.any(String),
          location: expect.any(String),
          image: expect.any(String),
          description: expect.any(String),
          date: expect.any(String),
          time: expect.any(String),
        });

        // checks date and time are valid
        expect(new Date(event.date).getTime()).toBeGreaterThan(0);
        expect(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(event.time)).toBe(
          true
        );
      });
  });
  test("returns 404 error message if given ID that does not exist", () => {
    return request(app)
      .get("/api/events/0")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toEqual("not found");
      });
  });
});

describe("POST /api/events", () => {
  test("returns the newly added event object", () => {
    const newEvent = {
      title: "Test Event",
      location: "Teston",
      image: "https://i.postimg.cc/2SgCQc6y/test.jpg",
      description: "A test event.",
      date: "2025-02-26T00:00:00.000Z",
      time: "06:00:00",
    };

    return request(app)
      .post("/api/events")
      .send(newEvent)
      .set("Accept", "application/json")
      .expect(201)
      .then((response) => {
        const responseEvent = response.body.event;

        expect(typeof responseEvent).toBe("object");

        expect(responseEvent).toMatchObject({
          event_id: expect.any(Number),
          title: "Test Event",
          location: "Teston",
          image: "https://i.postimg.cc/2SgCQc6y/test.jpg",
          description: "A test event.",
          date: "2025-02-26T00:00:00.000Z",
          time: "06:00:00",
        });
      });
  });
  test("new event is added to the events table", () => {
    const newEvent = {
      title: "Test Event",
      location: "Teston",
      image: "https://i.postimg.cc/2SgCQc6y/test.jpg",
      description: "A test event.",
      date: "2025-02-26T23:00:00.000Z",
      time: "06:00:00",
    };

    return request(app)
      .post("/api/events")
      .send(newEvent)
      .set("Accept", "application/json")
      .expect(201)
      .then(() => {
        return request(app)
          .get("/api/events")
          .expect(200)
          .then((response) => {
            const latestEvent = response.body.events.at(-1);

            expect(latestEvent).toMatchObject({
              event_id: expect.any(Number),
              title: "Test Event",
              location: "Teston",
              image: "https://i.postimg.cc/2SgCQc6y/test.jpg",
              description: "A test event.",
              date: "2025-02-26T00:00:00.000Z",
              time: "06:00:00",
            });
          });
      });
  });
});

describe("DELETE /api/events/:event_id", () => {
  test("responds with 204 and no content", () => {
    return request(app)
      .delete("/api/events/1")
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
      });
  });
  test("deletes event from events table", () => {
    return request(app)
      .delete("/api/events/1")
      .expect(204)
      .then(() => {
        return request(app)
          .get("/api/events/1")
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe("not found");
          });
      });
  });
  test("returns 404 error message if given event ID that does not exist", () => {
    return request(app)
      .delete("/api/events/1322334432")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("not found");
      });
  });
});

describe("PATCH /api/events/:event_id", () => {
  test("responds with updated event object", () => {
    const eventUpdate = {
      location: "Kettering",
      title: "The Kettering Pub Crawl",
    };

    return request(app)
      .patch("/api/events/1")
      .send(eventUpdate)
      .expect(200)
      .then((response) => {
        const responseEvent = response.body.event;
        expect(responseEvent).toEqual({
          event_id: 1,
          title: "The Kettering Pub Crawl",
          location: "Kettering",
          image: expect.any(String),
          description: expect.any(String),
          date: expect.any(String),
          time: expect.any(String),
        });
      });
  });
  test("event in database is updated", () => {
    const eventUpdate = {
      location: "Kettering",
      title: "The Kettering Pub Crawl",
      description: "A pub crawl across all the pubs in Kettering!",
    };

    return request(app)
      .patch("/api/events/1")
      .send(eventUpdate)
      .set("Accept", "application/json")
      .expect(200)
      .then(() => {
        return request(app)
          .get("/api/events/1")
          .expect(200)
          .then((response) => {
            const responseEvent = response.body.event;

            expect(responseEvent).toMatchObject({
              event_id: 1,
              title: "The Kettering Pub Crawl",
              location: "Kettering",
              image: expect.any(String),
              description: "A pub crawl across all the pubs in Kettering!",
              date: expect.any(String),
              time: expect.any(String),
            });
          });
      });
  });
});
