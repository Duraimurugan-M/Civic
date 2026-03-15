import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../services/api';
import useNotificationStore from '../store/notificationStore';
import { useEffect } from 'react';

export const useNotifications = (params) => {
  const setUnreadCount = useNotificationStore(s => s.setUnreadCount);

  const q = useQuery({
    queryKey: ['notifications', params],
    queryFn: () =>
      notificationAPI.getAll({ ...params, _silent: true }).then(r => r.data),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (q.data?.unread !== undefined) {
      setUnreadCount(q.data.unread);
    }
  }, [q.data]);

  return q;
};

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationAPI.markRead,
    onSuccess: () => qc.invalidateQueries(['notifications']),
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationAPI.markAllRead,
    onSuccess: () => qc.invalidateQueries(['notifications']),
  });
};