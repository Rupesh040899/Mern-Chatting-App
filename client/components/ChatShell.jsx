'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { fetchUsers } from '../services/userService';
import { fetchMessages, fetchUnreadCounts } from '../services/messageService';
import { toast } from '../utils/toast';
import { formatTime } from '../utils/date';
import { useSocket } from '../hooks/useSocket';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

function Avatar({ name, src, size = 'md', online }) {
  const initials = name ? name[0].toUpperCase() : '?';
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const dotSz = size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5';
  return (
    <div className="relative shrink-0">
      <div className={`${sz} rounded-2xl bg-zinc-800 dark:bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-700/50`}>
        {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span className="font-semibold text-ember-400">{initials}</span>}
      </div>
      {online !== undefined && (
        <span className={`${dotSz} absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white dark:border-zinc-950 ${online ? 'bg-emerald-400' : 'bg-zinc-400'}`} />
      )}
    </div>
  );
}

const IconSearch  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconSend    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg>;
const IconMoon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const IconSun     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;
const IconLogout  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconSmile   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;

export default function ChatShell() {
  const { user, token, logout, theme, setTheme } = useAuth();
  const { activeChat, setActiveChat, users, setUsers, messages, setMessages, typingStatus, setTypingStatus, onlineUsers, setOnlineUsers } = useChat();

  const [search, setSearch]               = useState('');
  const [messageText, setMessageText]     = useState('');
  const [loadingUsers, setLoadingUsers]   = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showEmoji, setShowEmoji]         = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [unreadCounts, setUnreadCounts]   = useState({});

  const chatBodyRef    = useRef(null);
  const inputRef       = useRef(null);
  const activeChatRef  = useRef(null);
  const typingTimer    = useRef(null);
  const sidebarRef     = useRef(null);
  const mainRef        = useRef(null);
  const chatHeaderRef  = useRef(null);
  const contactsRef    = useRef(null);
  const emojiRef       = useRef(null);
  const prevMsgCount   = useRef(0);

  const socketRef = useSocket(user);
  const router    = useRouter();

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);
  useEffect(() => { if (!user) router.push('/login'); }, [user, router]);

  // ── GSAP: layout entrance ──
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(sidebarRef.current, { x: -60, opacity: 0, duration: 0.7, ease: 'power4.out' });
      gsap.from(mainRef.current,    { x:  60, opacity: 0, duration: 0.7, ease: 'power4.out' });
    });
    return () => ctx.revert();
  }, []);

  // ── GSAP: contacts stagger in ──
  useEffect(() => {
    if (loadingUsers || !contactsRef.current) return;
    const items = contactsRef.current.querySelectorAll('[data-contact]');
    if (!items.length) return;
    gsap.fromTo(items,
      { x: -24, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.055, duration: 0.42, ease: 'power3.out', clearProps: 'all' }
    );
  }, [loadingUsers, users]);

  // ── GSAP: chat header slide-down on chat switch ──
  useEffect(() => {
    if (!activeChat || !chatHeaderRef.current) return;
    gsap.fromTo(chatHeaderRef.current,
      { y: -18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.38, ease: 'power3.out' }
    );
  }, [activeChat?._id]);

  // ── GSAP: new message bubble ──
  useEffect(() => {
    if (!chatBodyRef.current || messages.length === 0) return;
    if (messages.length <= prevMsgCount.current) { prevMsgCount.current = messages.length; return; }
    prevMsgCount.current = messages.length;
    const bubbles = chatBodyRef.current.querySelectorAll('[data-bubble]');
    if (!bubbles.length) return;
    const last = bubbles[bubbles.length - 1];
    const isMine = last.dataset.mine === 'true';
    gsap.fromTo(last,
      { x: isMine ? 32 : -32, opacity: 0, scale: 0.9 },
      { x: 0, opacity: 1, scale: 1, duration: 0.38, ease: 'back.out(1.8)', clearProps: 'all' }
    );
  }, [messages.length]);

  // ── GSAP: emoji picker pop ──
  useEffect(() => {
    if (!showEmoji || !emojiRef.current) return;
    gsap.fromTo(emojiRef.current,
      { scale: 0.85, opacity: 0, y: 14 },
      { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(2.2)' }
    );
  }, [showEmoji]);

  // ── GSAP: empty/welcome state ──
  useEffect(() => {
    if (activeChat) return;
    const icon = mainRef.current?.querySelector('[data-welcome-icon]');
    const text = mainRef.current?.querySelector('[data-welcome-text]');
    if (icon) gsap.fromTo(icon, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)', delay: 0.1 });
    if (text) gsap.fromTo(text, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', delay: 0.25 });
  }, [activeChat]);

  useEffect(() => {
    if (!token) return;
    fetchUnreadCounts(token).then(setUnreadCounts).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoadingUsers(true);
    fetchUsers(token, search)
      .then(setUsers)
      .catch((e) => toast.error(e.message || 'Failed to load contacts.'))
      .finally(() => setLoadingUsers(false));
  }, [search, token, setUsers]);

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    const onMessage = (msg) => {
      if (!msg) return;
      setMessages((prev) => [...prev, msg]);
      const senderId = msg.senderId?._id;
      if (senderId && senderId !== user?.id && activeChatRef.current?._id !== senderId) {
        setUnreadCounts((prev) => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));
        toast.newMessage(msg.senderId?.username, msg.text);
      }
    };
    const onTyping     = ({ senderId, isTyping }) => setTypingStatus((prev) => ({ ...prev, [senderId]: isTyping }));
    const onOnline     = (list) => setOnlineUsers(list);
    const onStatus     = ({ userId, status }) => setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isOnline: status === 'online' } : u));
    const onConnect    = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on('receive-message', onMessage);
    socket.on('message-sent',    onMessage);
    socket.on('typing',          onTyping);
    socket.on('online-users',    onOnline);
    socket.on('user-status',     onStatus);
    socket.on('connect',         onConnect);
    socket.on('disconnect',      onDisconnect);
    return () => {
      socket.off('receive-message', onMessage);
      socket.off('message-sent',    onMessage);
      socket.off('typing',          onTyping);
      socket.off('online-users',    onOnline);
      socket.off('user-status',     onStatus);
      socket.off('connect',         onConnect);
      socket.off('disconnect',      onDisconnect);
    };
  }, [socketRef, setMessages, setTypingStatus, setOnlineUsers, setUsers, user?.id]);

  useEffect(() => {
    if (!activeChat || !token) return;
    setLoadingMessages(true);
    fetchMessages(token, activeChat._id)
      .then(setMessages)
      .catch((e) => toast.error(e.message || 'Failed to load messages.'))
      .finally(() => setLoadingMessages(false));
  }, [activeChat, token, setMessages]);

  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, activeChat]);

  const contacts = useMemo(() => users.map((u) => ({
    ...u,
    isActive: activeChat?._id === u._id,
    online: onlineUsers.includes(u._id) || u.isOnline,
  })), [users, activeChat, onlineUsers]);

  if (!user) return null;

  const handleSelectUser = (contact) => {
    setActiveChat(contact);
    setMessageText('');
    setUnreadCounts((prev) => ({ ...prev, [contact._id]: 0 }));
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = () => {
    if (!messageText.trim() || !activeChat || !socketRef.current) return;
    socketRef.current.emit('send-message', { senderId: user.id, receiverId: activeChat._id, text: messageText.trim() });
    clearTimeout(typingTimer.current);
    socketRef.current.emit('typing', { senderId: user.id, receiverId: activeChat._id, isTyping: false });
    setMessageText('');
    setShowEmoji(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTypingInput = (value) => {
    setMessageText(value);
    if (!activeChat || !socketRef.current) return;
    if (value.trim()) {
      socketRef.current.emit('typing', { senderId: user.id, receiverId: activeChat._id, isTyping: true });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        socketRef.current?.emit('typing', { senderId: user.id, receiverId: activeChat._id, isTyping: false });
      }, 1500);
    } else {
      clearTimeout(typingTimer.current);
      socketRef.current.emit('typing', { senderId: user.id, receiverId: activeChat._id, isTyping: false });
    }
  };

  const isTypingActive = activeChat && typingStatus[activeChat._id];

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

      {/* ── Sidebar ── */}
      <aside ref={sidebarRef} className="flex w-72 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">

        {/* Profile row */}
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800/80 px-4 py-4">
          <Avatar name={user?.username} size="md" online={true} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user?.username}</p>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block h-1.5 w-1.5 rounded-full transition-colors ${socketConnected ? 'bg-emerald-400' : 'bg-zinc-400'}`} />
              <span className="text-xs text-zinc-500">{socketConnected ? 'Connected' : 'Reconnecting'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
              title="Toggle theme">
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>
            <button type="button" onClick={() => { logout(); router.push('/login'); }}
              className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-red-500 transition"
              title="Logout">
              <IconLogout />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center gap-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3 py-2.5 text-zinc-500">
            <IconSearch />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts..."
              className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500" />
          </div>
        </div>

        <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Conversations</p>

        {/* Contacts */}
        <div ref={contactsRef} className="flex-1 overflow-y-auto px-2 pb-2">
          {loadingUsers ? (
            [...Array(4)].map((_, i) => <div key={i} className="mb-1 h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />)
          ) : contacts.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-zinc-400">No contacts found.</p>
          ) : (
            contacts.map((contact) => (
              <button key={contact._id} type="button" data-contact onClick={() => handleSelectUser(contact)}
                className={`group relative mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                  contact.isActive ? 'bg-ember-500/10 dark:bg-ember-500/10' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
                }`}>
                {contact.isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-0.5 rounded-full bg-ember-500" />}
                <Avatar name={contact.username} src={contact.avatar} size="md" online={contact.online} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${contact.isActive ? 'text-ember-600 dark:text-ember-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {contact.username}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {typingStatus[contact._id] ? (
                      <span className="text-ember-500 dark:text-ember-400 flex items-center gap-1">
                        <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                        <span className="ml-1">typing</span>
                      </span>
                    ) : contact.online ? 'Online' : 'Offline'}
                  </p>
                </div>
                {unreadCounts[contact._id] > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ember-500 px-1.5 text-[11px] font-bold text-white">
                    {unreadCounts[contact._id] > 99 ? '99+' : unreadCounts[contact._id]}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main ref={mainRef} className="flex flex-1 min-w-0 flex-col bg-zinc-50 dark:bg-zinc-950">
        {activeChat ? (
          <>
            {/* Header */}
            <div ref={chatHeaderRef} className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 px-6 py-3.5 backdrop-blur-sm">
              <Avatar name={activeChat.username} src={activeChat.avatar} size="md" online={onlineUsers.includes(activeChat._id) || activeChat.isOnline} />
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{activeChat.username}</p>
                <p className="text-xs text-zinc-500">
                  {isTypingActive ? (
                    <span className="text-ember-500 dark:text-ember-400 flex items-center gap-1">
                      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                      <span className="ml-1">typing...</span>
                    </span>
                  ) : onlineUsers.includes(activeChat._id) || activeChat.isOnline ? (
                    <span className="flex items-center gap-1.5"><span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />Online</span>
                  ) : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatBodyRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-2">
              {loadingMessages ? (
                <div className="space-y-3 pt-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                      <div className={`h-12 w-48 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800`} />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div data-welcome-icon className="flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-100 dark:bg-zinc-900 text-2xl">💬</div>
                  <div data-welcome-text>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">Start the conversation</p>
                    <p className="text-sm text-zinc-500 max-w-xs mt-1">Say hello to {activeChat.username}. Messages appear here instantly.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId._id === user.id;
                  return (
                    <div key={msg._id} data-bubble data-mine={isMine.toString()}
                      className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {!isMine && <Avatar name={activeChat.username} src={activeChat.avatar} size="sm" />}
                      <div className={`max-w-sm lg:max-w-md xl:max-w-lg ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                        <div className={`rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? 'bg-gradient-to-br from-ember-500 to-orange-500 text-white bubble-mine'
                            : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/50 bubble-theirs'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>
                        <p className={`mt-1 font-mono text-[10px] text-zinc-400 dark:text-zinc-600 ${isMine ? 'text-right' : 'text-left'}`}>
                          {formatTime(msg.createdAt)}{isMine ? (msg.seen ? ' · Seen' : ' · Sent') : ''}
                        </p>
                      </div>
                      {isMine && <Avatar name={user.username} size="sm" />}
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="relative border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 px-4 py-3 backdrop-blur-sm">
              {showEmoji && (
                <div ref={emojiRef} className="absolute bottom-full left-4 mb-2 z-50 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xl">
                  <EmojiPicker onEmojiClick={(e) => setMessageText((prev) => prev + e.emoji)}
                    lazyLoadEmojis searchDisabled skinTonePickerLocation="PREVIEW"
                    theme={theme === 'dark' ? 'dark' : 'light'} />
                </div>
              )}
              <div className="flex items-end gap-2">
                <button type="button" onClick={() => setShowEmoji((p) => !p)}
                  className={`shrink-0 rounded-xl p-2.5 transition ${showEmoji ? 'bg-ember-500/10 text-ember-500' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                  <IconSmile />
                </button>
                <textarea ref={inputRef} value={messageText} onChange={(e) => handleTypingInput(e.target.value)}
                  onKeyDown={handleKeyDown} rows={1}
                  placeholder={`Message ${activeChat.username}...`}
                  className="min-h-[42px] max-h-32 flex-1 resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-ember-400 dark:focus:border-ember-500 focus:ring-2 focus:ring-ember-400/20" />
                <button type="button" onClick={handleSend} disabled={!messageText.trim()}
                  className="shrink-0 flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-ember-500 text-white transition hover:bg-ember-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
                  <IconSend />
                </button>
              </div>
              <p className="mt-1.5 px-1 text-[11px] text-zinc-400">Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-8">
            <div data-welcome-icon className="flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-100 dark:bg-zinc-900 text-4xl">✦</div>
            <div data-welcome-text>
              <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">No conversation open</p>
              <p className="mt-1 text-sm text-zinc-500">Select a contact from the left to start chatting.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
