const { z } = require('zod');

exports.complaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['road', 'water', 'electricity', 'garbage', 'sewage', 'park', 'streetlight', 'other']),
  departmentId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'emergency']).default('medium'),
  latitude: z.string().or(z.number()),
  longitude: z.string().or(z.number()),
  address: z.string().optional(),
});

exports.updateStatusSchema = z.object({
  status: z.enum(['pending', 'assigned', 'in_progress', 'resolved', 'rejected', 'escalated']),
  note: z.string().optional(),
  assignedTo: z.string().optional(),
});
