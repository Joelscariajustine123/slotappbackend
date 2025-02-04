import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  gcard: String,
  system: {
    type: String,
    enum: ["Laptop", "Desktop"],
    default: "Desktop",
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
  },
  slots: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slots",
    },
  ],
});

const Student = mongoose.model("Students", studentSchema);

export { studentSchema, Student };
