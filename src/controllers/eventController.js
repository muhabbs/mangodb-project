const Event = require("../models/Event");
const { createError } = require("../middleware/errorHandler");

async function createEvent(req, res, next) {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    return res.status(201).json({ success: true, event });
  } catch (err) {
    return next(err);
  }
}

async function getEvents(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.organizer) filter.organizer = req.query.organizer;
    if (req.query.search) filter.$text = { $search: req.query.search };
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate("organizer", "name email")
        .sort({ date: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      events
    });
  } catch (err) {
    return next(err);
  }
}

async function getEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id).populate("organizer", "name email");
    if (!event) throw createError(404, "Event not found");
    return res.status(200).json({ success: true, event });
  } catch (err) {
    return next(err);
  }
}

async function updateEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) throw createError(404, "Event not found");

    const isOwner = event.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      throw createError(403, "Only the organizer or an admin can update this event");
    }

    Object.assign(event, req.body);
    await event.save();
    await event.populate("organizer", "name email");

    return res.status(200).json({ success: true, event });
  } catch (err) {
    return next(err);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) throw createError(404, "Event not found");

    const isOwner = event.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      throw createError(403, "Only the organizer or an admin can delete this event");
    }

    await event.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { createEvent, getEvents, getEvent, updateEvent, deleteEvent };
