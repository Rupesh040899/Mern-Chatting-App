'use client';

import { apiClient, authHeader } from '../lib/apiClient';

export const fetchUsers = async (token, search = '') => {
  const response = await apiClient.get(`/users?search=${encodeURIComponent(search)}`, {
    headers: authHeader(token),
  });
  return response.data;
};

export const fetchCurrentUser = async (token) => {
  const response = await apiClient.get('/users/me', {
    headers: authHeader(token),
  });
  return response.data;
};
