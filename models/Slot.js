import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true,
  },
  time: {
    type: String,
    enum: ['9-11', '11-1', '1-3', '3-5'],
    required: true,
  },
});

const Slot = mongoose.model('Slots', slotSchema);

export {
  slotSchema,
  Slot
}





