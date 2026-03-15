const User         = require('../models/User');
const { generateToken } = require('../utils/helpers');
const emailService = require('../services/email.service');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, aadhaarNumber, role } = req.body;

    // Check duplicate email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    // Check duplicate Aadhaar — prevent fraud/fake registrations
    const aadhaarClean = aadhaarNumber.replace(/\s/g, '');
    const aadhaarExists = await User.findOne({ aadhaarNumber: aadhaarClean });
    if (aadhaarExists) {
      return res.status(400).json({
        success: false,
        message: 'This Aadhaar number is already registered. Each citizen can register only once.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      aadhaarNumber: aadhaarClean,
      role: role || 'citizen',
    });

    generateToken(user._id, res);
    emailService.sendWelcomeEmail(user).catch(() => {});
    res.status(201).json({ success: true, message: 'Registration successful', user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact admin.' });
    }
    generateToken(user._id, res);
    res.json({ success: true, message: 'Login successful', user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, aadhaarNumber } = req.body;
    const update = {};
    if (name)          update.name          = name;
    if (aadhaarNumber) update.aadhaarNumber = aadhaarNumber.replace(/\s/g, '');
    if (req.file) {
      const cloudinary = require('../services/cloudinary.service');
      update.avatar = await cloudinary.uploadImage(req.file.buffer, 'avatars');
    }
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// Citizen fills their complete profile — all fields mandatory
exports.updateFullProfile = async (req, res, next) => {
  try {
    const { name, phone, dob, address, city, district, state, pincode } = req.body;

    // Validate all required fields are present
    const missing = [];
    if (!name)     missing.push('Full Name');
    if (!phone)    missing.push('Phone Number');
    if (!dob)      missing.push('Date of Birth');
    if (!address)  missing.push('Address');
    if (!city)     missing.push('City');
    if (!district) missing.push('District');
    if (!state)    missing.push('State');
    if (!pincode)  missing.push('Pincode');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please fill in: ${missing.join(', ')}`,
      });
    }

    // Check phone is 10 digits
    if (!/^\d{10}$/.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ success: false, message: 'Phone number must be 10 digits' });
    }

    const update = {
      name, phone, dob, address, city, district, state, pincode,
      profileComplete: true,
    };

    if (req.file) {
      const cloudinary = require('../services/cloudinary.service');
      update.avatar = await cloudinary.uploadImage(req.file.buffer, 'avatars');
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};