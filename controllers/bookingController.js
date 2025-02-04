import { Student } from "../models/Students.js";
import mongoose from "mongoose";
import { Slot } from "../models/Slot.js";
import { Course } from "../models/Course.js";
export const getSlots = async (req, res) => {
  const slots = await Slot.find();
  res.json(slots);
};

export const getCourses = async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
};

export const createBooking = async (req, res) => {
  try {
    const { gno, name, course, slot, system } = req.body;

    console.log(gno, name, course, slot, system);

    const slotObjectIds = slot?.map(
      (slotId) => new mongoose.Types.ObjectId(slotId)
    );

    // Check if the slot registration exceeds 20 students for each slot
    const fullSlots = [];
    for (const slotId of slotObjectIds) {
      const studentCount = await Student.countDocuments({ slots: slotId });
      if (studentCount > 21) {
        const slotDetails = await Slot.findById(slotId).select("day time");
        if (slotDetails) {
          fullSlots.push(`${slotDetails.day} at ${slotDetails.time}`);
        }
      }
    }

    if (fullSlots.length > 0) {
      return res
        .status(400)
        .json({ message: `Slots full: ${fullSlots.join(", ")}` });
    }

    const student = new Student({
      gcard: gno,
      name: name,
      system: system,
      course: new mongoose.Types.ObjectId(course),
      slots: slotObjectIds,
    });

    await student.save();
    res.status(201).json({ message: "Booking successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { _id, name, gno, sid } = req.body;

    // Convert slot IDs to ObjectIds if provided
    const slotObjectIds = sid
      ? sid.map((slotId) => new mongoose.Types.ObjectId(slotId))
      : undefined;

    // Create update object with only provided fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (gno) updateFields.gcard = gno;
    if (slotObjectIds) updateFields.slots = slotObjectIds;

    const updatedStudent = await Student.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Booking updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete booking
export const deleteBooking = async (req, res) => {
  try {
    const { _id } = req.body;

    const deletedStudent = await Student.findByIdAndDelete(_id);

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getSlotStudentCount = async (req, res) => {
  try {
    const { slotId } = req.params;

    const studentCount = await Student.countDocuments({
      slots: new mongoose.Types.ObjectId(slotId),
    });

    res.json({
      slotId,
      studentCount,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid slot ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getCourseStudentCount = async (req, res) => {
  try {
    const { courseId } = req.params;

    const studentCount = await Student.countDocuments({
      course: new mongoose.Types.ObjectId(courseId),
    });

    res.json({
      courseId,
      studentCount,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid course ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getSlotsWithStudentCounts = async (req, res) => {
  try {
    const slots = await Slot.find(); // Fetch all slots
    const slotsWithCounts = await Promise.all(
      slots.map(async (slot) => {
        const studentCount = await Student.countDocuments({ slots: slot._id });
        const laptopCount = await Student.countDocuments({
          slots: slot._id,
          system: "Laptop",
        });
        const DesktopCount = await Student.countDocuments({
          slots: slot._id,
          system: "Desktop",
        });
        const availabelcount = 20 - studentCount;
        return {
          slotId: slot._id,
          day: slot.day,
          time: slot.time,
          availabelcount,
          studentCount,
          DesktopCount,
          laptopCount,
        };
      })
    );

    res.json(slotsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllStudentDetails = async (req, res) => {
  try {
    const students = await Student.find().populate("course").populate("slots");

    const studentDetails = students.map((student) => {
      return {
        id: student._id,
        name: student.name,
        gno: student.gcard,
        courseName: student.course ? student.course.name : null,
        slots: student.slots.map((slot) => ({
          day: slot.day,
          time: slot.time,
        })),
        system: student.system,
      };
    });

    res.json(studentDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStudentDetails = async (req, res) => {
  try {
    const { id } = req.params; // Get student ID from the request parameters
    const { name, gno, course, slot, system } = req.body; // Get updated details from the request body

    console.log(id,name,gno,course,slot,system)

   
    const fullSlots = [];
    if (slot) {
      const slotObjectIds = slot.map(
        (slotId) => new mongoose.Types.ObjectId(slotId)
      );

      for (const slotId of slotObjectIds) {
        const studentCount = await Student.countDocuments({ slots: slotId });
        if (studentCount >= 20) {
          const slotDetails = await Slot.findById(slotId).select("day time");
          if (slotDetails) {
            fullSlots.push(`${slotDetails.day} at ${slotDetails.time}`);
          }
        }
      }
    }

    if (fullSlots.length > 0) {
      return res
        .status(400)
        .json({ message: `Slots full: ${fullSlots.join(", ")}` });
    }

    // // Create an update object with only provided fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (gno) updateFields.gcard = gno;
    if (course) updateFields.course = new mongoose.Types.ObjectId(course);
    if (slot)
      updateFields.slots = slot.map(
        (slotId) => new mongoose.Types.ObjectId(slotId)
      );

    if (system) updateFields.system = system;

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Student details updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params; // Get student ID from the request parameters

    const student = await Student.findById(id)
      .populate("course")
      .populate("slots");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentDetails = {
      name: student.name,
      gno: student.gcard,
      courseId: student.course ? student.course._id : null,
      courseName: student.course ? student.course.name : null,
      slots: student.slots.map((slot) => ({
        _id: slot._id,
        day: slot.day,
        time: slot.time,
      })),
      system: student.system,
    };

    res.json(studentDetails);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getCourseStats = async (req, res) => {
    try {
        // Get enrollment statistics with a single aggregation pipeline
        const courseStats = await Course.aggregate([
            {
                // Start with courses collection
                $lookup: {
                    from: "students", // Using students collection directly
                    localField: "_id",
                    foreignField: "course",
                    as: "enrollments"

                }
            },
            {
                // Project the fields we want
                $project: {
                    name: 1,
                    studentCount: { $size: "$enrollments" },
                    students: {
                        $map: {
                            input: "$enrollments",
                            as: "enrollment",
                            in: {
                                name: "$$enrollment.name",
                                gno: "$$enrollment.gcard"
                            }
                        }
                    }
                }
            },
            {
                // Sort by course name
                $sort: { name: 1 }
            }
        ]);


        res.status(200).json(courseStats);
    } catch (error) {
        console.error('Error in getCourseStats:', error);
        res.status(500).json({ 
            message: "Error fetching course statistics", 
            error: error.message 
        });
    }
};

export const deleteStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};
