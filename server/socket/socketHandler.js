const Message = require('../models/Message');
const User = require('../models/User');

const activeUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    socket.on('user-connected', async (userId) => {
      if (!userId) return;
      activeUsers.set(userId, socket.id);
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
      } catch (err) {
        console.error('user-connected error:', err.message);
      }
      io.emit('online-users', Array.from(activeUsers.keys()));
      socket.broadcast.emit('user-status', { userId, status: 'online' });
    });

    socket.on('send-message', async (payload) => {
      const { senderId, receiverId, text } = payload || {};
      if (!senderId || !receiverId || !text) return;

      try {
        let message = await Message.create({ senderId, receiverId, text });
        message = await message.populate('senderId', 'username avatar');
        message = await message.populate('receiverId', 'username avatar');

        const receiverSocket = activeUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket).emit('receive-message', message);
        }
        socket.emit('message-sent', message);
      } catch (err) {
        console.error('send-message error:', err.message);
      }
    });

    socket.on('typing', ({ senderId, receiverId, isTyping }) => {
      const receiverSocket = activeUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit('typing', { senderId, isTyping });
      }
    });

    socket.on('disconnect', async () => {
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          try {
            await User.findByIdAndUpdate(userId, { isOnline: false });
          } catch (err) {
            console.error('disconnect error:', err.message);
          }
          socket.broadcast.emit('online-users', Array.from(activeUsers.keys()));
          socket.broadcast.emit('user-status', { userId, status: 'offline' });
          break;
        }
      }
    });
  });
};

module.exports = socketHandler;
