import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// @desc    Check-in for today
// @route   POST /api/attendance/check-in
// @access  Private
export const checkIn = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    // Simple logic: if after 9:15 AM, marked as Late
    let status = 'Present';
    if (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15)) {
      status = 'Late';
    }

    const attendance = await Attendance.findOneAndUpdate(
      { user: req.user._id, date: today },
      { checkIn: now, status },
      { upsert: true, new: true }
    );

    res.status(200).json(attendance);
  } catch (error) {
    next(error);
  }
};

// @desc    Check-out for today
// @route   POST /api/attendance/check-out
// @access  Private
export const checkOut = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const attendance = await Attendance.findOneAndUpdate(
      { user: req.user._id, date: today },
      { checkOut: now },
      { new: true }
    );

    if (!attendance) {
      res.status(404);
      throw new Error('No check-in record found for today');
    }

    res.status(200).json(attendance);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's attendance status for today
// @route   GET /api/attendance/my-status
// @access  Private
export const getMyStatus = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ user: req.user._id, date: today });
    res.status(200).json(attendance || { checkedIn: false });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance records for HR
// @route   GET /api/attendance/all
// @access  Private (Admin/HR)
export const getAllAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find().populate('user', 'name email role avatar').sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};
