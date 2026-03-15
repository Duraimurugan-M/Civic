const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

exports.getAnalytics = async (req, res, next) => {
  try {
    const [totalComplaints, pendingComplaints, resolvedComplaints, totalUsers,
      byCategory, byStatus, byPriority, recentTrend, departmentStats, avgRating] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: { $in: ['pending', 'assigned', 'in_progress'] } }),
      Complaint.countDocuments({ status: 'resolved' }),
      User.countDocuments({ role: 'citizen' }),
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Complaint.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }, { $limit: 30 },
      ]),
      Complaint.aggregate([
        { $match: { departmentId: { $exists: true } } },
        { $group: { _id: '$departmentId', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
        { $unwind: '$dept' },
        { $project: { name: '$dept.name', total: 1, resolved: 1 } },
      ]),
      Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    ]);

    res.json({
      success: true,
      stats: {
        totalComplaints, pendingComplaints, resolvedComplaints, totalUsers,
        avgRating: avgRating[0]?.avg?.toFixed(1) || 0,
        resolutionRate: totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : 0,
      },
      byCategory, byStatus, byPriority, recentTrend, departmentStats,
    });
  } catch (err) { next(err); }
};
