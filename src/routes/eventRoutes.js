const express = require("express");
const { z } = require("zod");

const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");

const router = express.Router();
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");
const isoDate = z.string().datetime({ offset: true });

const eventBody = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(5000),
  date: isoDate.transform((value) => new Date(value)),
  location: z.string().trim().min(2).max(200)
});

const createEventSchema = z.object({ body: eventBody });
const updateEventSchema = z.object({
  params: z.object({ id: objectId }),
  body: eventBody.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  })
});

const idParamSchema = z.object({ params: z.object({ id: objectId }) });
const listEventsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    organizer: objectId.optional(),
    search: z.string().trim().min(1).max(100).optional(),
    from: isoDate.optional(),
    to: isoDate.optional()
  })
});

router.get("/", validate(listEventsSchema), getEvents);
router.get("/:id", validate(idParamSchema), getEvent);
router.post("/", authenticate, validate(createEventSchema), createEvent);
router.patch("/:id", authenticate, validate(updateEventSchema), updateEvent);
router.delete("/:id", authenticate, validate(idParamSchema), deleteEvent);

module.exports = router;
