const User = require('../models/User');

exports.getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role)   filter.role = role;
    if (search) filter.$or  = [
      { name:      { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
      { citizenId: { $regex: search, $options: 'i' } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('departmentId', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password'),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// Get single user full profile — for admin to view citizen details
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('departmentId', 'name')
      .select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// Admin creates staff or supervisor directly — no citizen signup needed
exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, password, aadhaarNumber, role, departmentId } = req.body;

    // Only staff and supervisor can be created this way
    if (!['staff', 'supervisor'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be staff or supervisor' });
    }

    // Check duplicate email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    // Check duplicate Aadhaar
    const aadhaarClean  = aadhaarNumber.replace(/\s/g, '');
    const aadhaarExists = await User.findOne({ aadhaarNumber: aadhaarClean });
    if (aadhaarExists) {
      return res.status(400).json({
        success: false,
        message: 'This Aadhaar number is already registered in the system',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      aadhaarNumber: aadhaarClean,
      role,
      departmentId,
      isVerified:      true,
      profileComplete: true,
    });

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
      user,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { role, departmentId, isActive } = req.body;
    const update = {};
    if (role         !== undefined) update.role         = role;
    if (departmentId !== undefined) update.departmentId = departmentId || null;
    if (isActive     !== undefined) update.isActive     = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('departmentId', 'name');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (err) {
    next(err);
  }
};