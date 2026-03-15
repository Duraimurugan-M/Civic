const Notification = require('../models/Notification');

exports.createNotification = async ({ userId, title, message, type = 'system', relatedId }) => {
  try {
    await Notification.create({ userId, title, message, type, relatedId });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

exports.notifyComplaintSubmitted = (complaint) =>
  exports.createNotification({
    userId: complaint.citizenId,
    title: 'Complaint Submitted',
    message: `Your complaint "${complaint.title}" has been submitted and is pending review.`,
    type: 'complaint',
    relatedId: complaint._id,
  });

exports.notifyStatusUpdate = (complaint, userId) =>
  exports.createNotification({
    userId,
    title: 'Complaint Status Updated',
    message: `Complaint "${complaint.title}" status changed to ${complaint.status.replace('_', ' ')}.`,
    type: 'status',
    relatedId: complaint._id,
  });

exports.notifyAssigned = (complaint, staffId) =>
  exports.createNotification({
    userId: staffId,
    title: 'New Complaint Assigned',
    message: `A new complaint "${complaint.title}" has been assigned to you.`,
    type: 'complaint',
    relatedId: complaint._id,
  });
