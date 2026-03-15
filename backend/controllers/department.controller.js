const Department = require('../models/Department');

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).sort('name');
    res.json({ success: true, departments });
  } catch (err) { next(err); }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ success: true, department: dept });
  } catch (err) { next(err); }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, department: dept });
  } catch (err) { next(err); }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    await Department.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Department deactivated' });
  } catch (err) { next(err); }
};
