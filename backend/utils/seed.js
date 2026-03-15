require('dotenv').config();
const mongoose    = require('mongoose');
const Department  = require('../models/Department');
const User        = require('../models/User');

const departments = [
  { name:'Roads & Infrastructure',  description:'Road repair, potholes, bridges, footpaths' },
  { name:'Water Supply',            description:'Water leakage, low pressure, supply issues' },
  { name:'Electricity Board',       description:'Power outages, streetlight failures' },
  { name:'Sanitation & Waste',      description:'Garbage collection, sewage, drains' },
  { name:'Parks & Recreation',      description:'Park maintenance, trees, open spaces' },
  { name:'General Services',        description:'Other civic issues not listed above' },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Department.deleteMany({});
  await Department.insertMany(departments);
  console.log('✅ Departments seeded:', departments.length);

  const existing = await User.findOne({ role:'admin' });
  if (!existing) {
    await User.create({
      name:          'Admin User',
      email:         'mdmurugan484@gmail.com',
      password:      'Admin@123',
      aadhaarNumber: '123456789012',
      role:          'admin',
      isVerified:    true,
    });
    console.log('✅ Admin created: mdmurugan484@gmail.com / Admin@123');
  } else {
    console.log('ℹ️  Admin already exists');
  }
  process.exit(0);
};

seed().catch(e => { console.error(e); process.exit(1); });
