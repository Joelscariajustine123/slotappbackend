import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    name: String,
})

const Course = mongoose.model('Courses', courseSchema);

export { courseSchema, Course };