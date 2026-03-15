import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useComplaints = (params) => useQuery({
  queryKey: ['complaints', params],
  queryFn: () => complaintAPI.getAll(params).then(r => r.data),
});

export const useComplaint = (id) => useQuery({
  queryKey: ['complaint', id],
  queryFn: () => complaintAPI.getById(id).then(r => r.data),
  enabled: !!id,
});

export const useCreateComplaint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: complaintAPI.create,
    onSuccess: () => { qc.invalidateQueries(['complaints']); toast.success('Complaint submitted!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to submit'),
  });
};

export const useUpdateStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => complaintAPI.updateStatus(id, data),
    onSuccess: (_, v) => { qc.invalidateQueries(['complaint', v.id]); qc.invalidateQueries(['complaints']); toast.success('Status updated!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update'),
  });
};

export const useSupportComplaint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: complaintAPI.support,
    onSuccess: (_, id) => { qc.invalidateQueries(['complaint', id]); toast.success('Supported!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Already supported'),
  });
};
