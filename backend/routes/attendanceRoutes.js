import express from 'express';
import { checkIn, checkOut, getMyStatus, getAllAttendance } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/my-status', protect, getMyStatus);
router.get('/all', protect, authorize('admin', 'hr'), getAllAttendance);

export default router;
