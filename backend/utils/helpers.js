exports.paginate = (query, page = 1, limit = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return { skip, limit: parseInt(limit) };
};

exports.buildFilter = (params) => {
  const filter = {};
  if (params.status) filter.status = params.status;
  if (params.category) filter.category = params.category;
  if (params.priority) filter.priority = params.priority;
  if (params.departmentId) filter.departmentId = params.departmentId;
  if (params.citizenId) filter.citizenId = params.citizenId;
  if (params.search) filter.title = { $regex: params.search, $options: 'i' };
  return filter;
};

exports.generateToken = (userId, res) => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '7d',
  });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
};
