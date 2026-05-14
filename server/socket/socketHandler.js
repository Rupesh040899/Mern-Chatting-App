const { MOCK_USERS, mockMessages } = require('../config/mockData');

const activeUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    socket.on('user-connected', (userId) => {
      activeUsers.set(userId, socket.id);
      const user = MOCK_USERS.find((u) => u._id === userId);
      if (user) user.isOnline = true;
      io.emit('online-users', Array.from(activeUsers.keys()));
      socket.broadcast.emit('user-status', { userId, status: 'online' });
    });

    socket.on('send-message', (payload) => {
      const { senderId, receiverId, text } = payload;
      if (!senderId || !receiverId || !text) return;

      const sender = MOCK_USERS.find((u) => u._id === senderId);
      const receiver = MOCK_USERS.find((u) => u._id === receiverId);
      if (!sender || !receiver) return;

      const message = {
        _id: `msg_${Date.now()}`,
        senderId: { _id: sender._id, username: sender.username, avatar: sender.avatar },
        receiverId: { _id: receiver._id, username: receiver.username, avatar: receiver.avatar },
        text,
        seen: false,
        createdAt: new Date().toISOString(),
      };
      mockMessages.push(message);

      const receiverSocket = activeUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit('receive-message', message);
      }
      socket.emit('message-sent', message);
    });

    socket.on('typing', ({ senderId, receiverId, isTyping }) => {
      const receiverSocket = activeUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit('typing', { senderId, isTyping });
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          const user = MOCK_USERS.find((u) => u._id === userId);
          if (user) user.isOnline = false;
          socket.broadcast.emit('online-users', Array.from(activeUsers.keys()));
          socket.broadcast.emit('user-status', { userId, status: 'offline' });
          break;
        }
      }
    });
  });
};

module.exports = socketHandler;
