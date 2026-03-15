const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');

exports.submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (complaint.status !== 'resolved') return res.status(400).json({ success: false, message: 'Can only rate resolved complaints' });
    if (complaint.citizenId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Forbidden' });

    const existing = await Feedback.findOne({ complaintId: req.params.id });
    if (existing) return res.status(400).json({ success: false, message: 'Already rated' });

    const feedback = await Feedback.create({ complaintId: req.params.id, citizenId: req.user._id, rating, comment });
    res.status(201).json({ success: true, feedback });
  } catch (err) { next(err); }
};

exports.getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ complaintId: req.params.id }).populate('citizenId', 'name avatar');
    res.json({ success: true, feedback });
  } catch (err) { next(err); }
};
