const { z } = require('zod');

exports.registerSchema = z.object({
  name:          z.string().min(2, 'Name must be at least 2 characters').trim(),
  email:         z.string().email('Invalid email address').trim(),
  password:      z.string().min(6, 'Password must be at least 6 characters'),
  aadhaarNumber: z.string()
    .transform(val => val.replace(/\s/g, ''))
    .refine(val => /^\d{12}$/.test(val), { message: 'Aadhaar must be exactly 12 digits' }),
  role:          z.enum(['citizen', 'staff', 'supervisor', 'admin']).default('citizen'),
});

exports.loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

exports.createStaffSchema = z.object({
  name:          z.string().min(2, 'Name must be at least 2 characters').trim(),
  email:         z.string().email('Invalid email address').trim(),
  password:      z.string().min(6, 'Password must be at least 6 characters'),
  aadhaarNumber: z.string()
    .transform(val => val.replace(/\s/g, ''))
    .refine(val => /^\d{12}$/.test(val), { message: 'Aadhaar must be exactly 12 digits' }),
  role:          z.enum(['staff', 'supervisor'], { message: 'Role must be staff or supervisor' }),
  departmentId:  z.string().min(1, 'Department is required'),
});