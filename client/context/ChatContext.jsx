'use client';

import { createContext, useContext, useMemo, useState } from 'react';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [activeChat, setActiveChat] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

  const value = useMemo(
    () => ({
      activeChat,
      setActiveChat,
      users,
      setUsers,
      messages,
      setMessages,
      typingStatus,
      setTypingStatus,
      onlineUsers,
      setOnlineUsers,
    }),
    [activeChat, users, messages, typingStatus, onlineUsers]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
