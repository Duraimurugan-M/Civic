const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const { createNotification } = require('../services/notification.service');

// Every hour: remind staff of unresolved complaints
const reminderJob = cron.schedule('0 * * * *', async () => {
  try {
    const unresolved = await Complaint.find({
      status: { $in: ['assigned', 'in_progress'] },
      assignedTo: { $exists: true, $ne: null },
    }).populate('assignedTo', '_id name');

    for (const complaint of unresolved) {
      await createNotification({
        userId: complaint.assignedTo._id,
        title: 'Reminder: Unresolved Complaint',
        message: `Complaint "${complaint.title}" is still unresolved. Please take action.`,
        type: 'reminder',
        relatedId: complaint._id,
      });
    }
    console.log(`⏰ Sent reminders for ${unresolved.length} unresolved complaints`);
  } catch (err) {
    console.error('Reminder job error:', err.message);
  }
}, { scheduled: false });

// Every 6 hours: escalate overdue complaints
const escalateJob = cron.schedule('0 */6 * * *', async () => {
  try {
    const overdue = await Complaint.find({
      status: { $nin: ['resolved', 'rejected', 'escalated'] },
      deadline: { $lt: new Date() },
    });

    for (const complaint of overdue) {
      complaint.status = 'escalated';
      await complaint.save();
    }
    console.log(`⚠️ Escalated ${overdue.length} overdue complaints`);
  } catch (err) {
    console.error('Escalation job error:', err.message);
  }
}, { scheduled: false });

module.exports = { reminderJob, escalateJob };
