const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 160
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    location: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

eventSchema.index({ title: "text", description: "text", location: "text" });

eventSchema.methods.toJSON = function toJSON() {
  const event = this.toObject();
  delete event.__v;
  return event;
};

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);
