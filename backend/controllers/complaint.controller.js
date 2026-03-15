const Complaint        = require('../models/Complaint');
const ComplaintSupport = require('../models/ComplaintSupport');
const StatusLog        = require('../models/StatusLog');
const User             = require('../models/User');
const { uploadImage }  = require('../services/cloudinary.service');
const notifService     = require('../services/notification.service');
const emailService     = require('../services/email.service');
const { paginate, buildFilter } = require('../utils/helpers');

exports.checkDuplicate = async (req, res, next) => {
  try {
    const { latitude, longitude, category } = req.body;

    const duplicate = await Complaint.findOne({
      category,
      status: { $nin: ['resolved', 'rejected'] },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: 30,
        },
      },
    }).populate('citizenId', 'name citizenId');

    res.json({
      success: true,
      duplicate: !!duplicate,
      complaint: duplicate || null,
    });
  } catch (err) {
    next(err);
  }
};

exports.createComplaint = async (req, res, next) => {
  try {
    const {
      title, description, category, departmentId,
      priority, latitude, longitude, address,
    } = req.body;

    const images = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file.buffer, 'complaints');
        images.push(url);
      }
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      citizenId:    req.user._id,
      departmentId: departmentId || undefined,
      images,
      location: {
        type:        'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address,
      },
    });

    await StatusLog.create({
      complaintId: complaint._id,
      status:      'pending',
      updatedBy:   req.user._id,
      note:        'Complaint submitted by citizen',
    });

    notifService.notifyComplaintSubmitted(complaint);

    // Send email — fetch fresh user to ensure email field is present
    const citizen = await User.findById(req.user._id).select('name email citizenId');
    if (citizen) {
      emailService.sendComplaintSubmittedEmail(citizen, complaint).catch(err => {
        console.error('Email send error (complaint submitted):', err.message);
      });
    }

    res.status(201).json({ success: true, message: 'Complaint submitted', complaint });
  } catch (err) {
    next(err);
  }
};

exports.getComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', ...filterParams } = req.query;

    if (req.user.role === 'citizen') filterParams.citizenId    = req.user._id;
    if (req.user.role === 'staff')   filterParams.departmentId = req.user.departmentId;

    const filter      = buildFilter(filterParams);
    const { skip }    = paginate(null, page, limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('citizenId',    'name email avatar citizenId aadhaarNumber')
        .populate('departmentId', 'name')
        .populate('assignedTo',   'name email'),
      Complaint.countDocuments(filter),
    ]);

    res.json({
      success: true,
      complaints,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizenId',    'name email avatar citizenId aadhaarNumber')
      .populate('departmentId', 'name')
      .populate('assignedTo',   'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const logs = await StatusLog.find({ complaintId: complaint._id })
      .populate('updatedBy', 'name role')
      .sort('timestamp');

    // Block owner from supporting own complaint
    const isOwner = complaint.citizenId?._id?.toString() === req.user._id.toString();
    const supportRecord = isOwner
      ? null
      : await ComplaintSupport.findOne({
          complaintId: complaint._id,
          citizenId:   req.user._id,
        });

    const userSupported = isOwner ? 'owner' : !!supportRecord;

    res.json({ success: true, complaint, logs, userSupported });
  } catch (err) {
    next(err);
  }
};

exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note, assignedTo } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // ── BLOCK STATUS UPDATE IF ALREADY RESOLVED OR REJECTED ──
    if (complaint.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'This complaint is already resolved and cannot be updated further.',
      });
    }

    if (complaint.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'This complaint has been rejected and cannot be updated further.',
      });
    }

    // Apply updates
    complaint.status = status;
    if (assignedTo)         complaint.assignedTo = assignedTo;
    if (status === 'resolved') complaint.resolvedAt = new Date();

    // Handle proof image uploads
    if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
      if (req.files.beforeImage?.[0]) {
        complaint.beforeImage = await uploadImage(req.files.beforeImage[0].buffer, 'proofs');
      }
      if (req.files.afterImage?.[0]) {
        complaint.afterImage = await uploadImage(req.files.afterImage[0].buffer, 'proofs');
      }
    }

    await complaint.save();

    await StatusLog.create({
      complaintId: complaint._id,
      status,
      updatedBy:   req.user._id,
      note,
    });

    // Notify citizen in portal
    notifService.notifyStatusUpdate(complaint, complaint.citizenId);
    if (assignedTo) notifService.notifyAssigned(complaint, assignedTo);

    // ── SEND EMAIL TO CITIZEN ──
    // Always fetch citizen fresh from DB to guarantee email field is present
    const citizenId = complaint.citizenId?._id || complaint.citizenId;
    const citizen   = await User.findById(citizenId).select('name email');

    if (citizen && citizen.email) {
      if (status === 'resolved') {
        emailService.sendResolutionEmail(citizen, complaint).catch(err => {
          console.error('Email send error (resolution):', err.message);
        });
      } else {
        emailService.sendStatusUpdateEmail(citizen, complaint).catch(err => {
          console.error('Email send error (status update):', err.message);
        });
      }
    } else {
      console.warn('Could not send email — citizen not found for complaint:', complaint._id);
    }

    res.json({ success: true, message: 'Status updated successfully', complaint });
  } catch (err) {
    next(err);
  }
};

exports.supportComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Block owner from supporting own complaint
    if (complaint.citizenId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot support your own complaint',
      });
    }

    const existing = await ComplaintSupport.findOne({
      complaintId: req.params.id,
      citizenId:   req.user._id,
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already supported this complaint' });
    }

    await ComplaintSupport.create({
      complaintId: req.params.id,
      citizenId:   req.user._id,
    });

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $inc: { supportCount: 1 } },
      { new: true }
    );

    res.json({ success: true, supportCount: updated.supportCount });
  } catch (err) {
    next(err);
  }
};

exports.getMapComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({
      'location.coordinates': { $exists: true },
    })
      .select('title category status priority location supportCount complaintCode createdAt')
      .limit(500);

    res.json({ success: true, complaints });
  } catch (err) {
    next(err);
  }
};

exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    if (
      complaint.citizenId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await complaint.deleteOne();
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (err) {
    next(err);
  }
};