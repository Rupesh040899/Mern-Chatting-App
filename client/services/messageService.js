'use client';

import { apiClient, authHeader } from '../lib/apiClient';

export const fetchMessages = async (token, userId) => {
  const response = await apiClient.get(`/messages/${userId}`, {
    headers: authHeader(token),
  });
  return response.data;
};

export const fetchUnreadCounts = async (token) => {
  const response = await apiClient.get('/messages/unread', {
    headers: authHeader(token),
  });
  return response.data;
};

export const sendMessage = async (token, payload) => {
  const response = await apiClient.post('/messages', payload, {
    headers: authHeader(token),
  });
  return response.data;
};
