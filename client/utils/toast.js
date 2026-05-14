'use client';

const createToast = (message, type) => {
  const event = new CustomEvent('chat-toast', {
    detail: { message, type },
  });
  window.dispatchEvent(event);
};

export const toast = {
  success: (message) => createToast(message, 'success'),
  error: (message) => createToast(message, 'error'),
  info: (message) => createToast(message, 'info'),
  newMessage: (sender, message) => {
    const event = new CustomEvent('chat-toast', {
      detail: { sender, message, type: 'message' },
    });
    window.dispatchEvent(event);
  },
};
