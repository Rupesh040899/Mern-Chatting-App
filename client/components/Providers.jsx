'use client';

import { AuthProvider } from '../context/AuthContext';
import { ChatProvider } from '../context/ChatContext';
import ToastContainer from './ToastContainer';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ChatProvider>
        {children}
        <ToastContainer />
      </ChatProvider>
    </AuthProvider>
  );
}
