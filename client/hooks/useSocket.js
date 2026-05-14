'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (user) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    socketRef.current = io(socketUrl, { transports: ['websocket'] });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('user-connected', user.id);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  return socketRef;
};
