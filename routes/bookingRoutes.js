import express from 'express';
import { createBooking,deleteStudentById,getAllStudentDetails,getStudentDetails,updateStudentDetails,getSlotsWithStudentCounts, updateBooking, deleteBooking, getSlotStudentCount, getCourseStudentCount ,getSlots,getCourses, getCourseStats} from '../controllers/bookingController.js';

const router = express.Router();

router.post('/create', createBooking);
router.put('/update', updateBooking);
router.delete('/delete', deleteBooking);
router.get('/getSlotStudentCount/:slotId', getSlotStudentCount);
router.get('/getStudentCount/:courseId', getCourseStudentCount);
router.get('/getCourses', getCourses);
router.get('/getSlots', getSlots);
router.get('/getSlotswithcount', getSlotsWithStudentCounts);
router.get('/getAllStudentDetails', getAllStudentDetails);
router.get('/getStudentDetails/:id', getStudentDetails);
router.put('/updateStudentDetails/:id', updateStudentDetails);
router.get('/getCourseStats', getCourseStats);
router.delete('/deleteStudent/:id', deleteStudentById);
export default router; 