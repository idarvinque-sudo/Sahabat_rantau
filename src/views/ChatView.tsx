import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Phone, Video, CheckCheck, MoreVertical, ChevronLeft, ShieldCheck } from 'lucide-react';
import { ChatConversation, ChatMessage, MatchProfile, UserProfile } from '../types';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import {
  subscribeToUserChats,
  subscribeToChatMessages,
  sendChatMessage,
  createOrGetChat,
} from '../firebase/chatService';

interface ChatViewProps {
  initialRecipient?: MatchProfile | null;
  currentUser?: UserProfile | null;
}

export const ChatView: React.FC<ChatViewProps> = ({ initialRecipient, currentUser }) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeRecipient, setActiveRecipient] = useState<{
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
    online: boolean;
    role?: string;
  } | null>(null);

  const [inputText, setInputText] = useState<string>('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If initialRecipient was provided from Match swipe
  useEffect(() => {
    if (initialRecipient && currentUser) {
      createOrGetChat(currentUser, initialRecipient).then((chatId) => {
        setActiveChatId(chatId);
        setActiveRecipient({
          id: initialRecipient.id,
          name: initialRecipient.name,
          avatar: initialRecipient.photo,
          isVerified: initialRecipient.isVerified,
          online: initialRecipient.isOnline,
          role: 'Match Baru ❤️',
        });
      });
    } else if (initialRecipient) {
      setActiveChatId(initialRecipient.id);
      setActiveRecipient({
        id: initialRecipient.id,
        name: initialRecipient.name,
        avatar: initialRecipient.photo,
        isVerified: initialRecipient.isVerified,
        online: initialRecipient.isOnline,
        role: 'Match Baru ❤️',
      });
    }
  }, [initialRecipient, currentUser]);

  // Subscribe to user chats from Firestore
  useEffect(() => {
    if (currentUser?.uid) {
      const unsub = subscribeToUserChats(currentUser.uid, (chats) => {
        setConversations(chats);
      });
      return () => unsub();
    }
  }, [currentUser?.uid]);

  // Subscribe to messages when active chat opens
  useEffect(() => {
    if (activeChatId) {
      const unsub = subscribeToChatMessages(activeChatId, (msgs) => {
        setMessages(msgs);
      });
      return () => unsub();
    }
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpenConversation = (target: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
    online: boolean;
    role?: string;
  }) => {
    setActiveRecipient(target);
    if (currentUser) {
      createOrGetChat(currentUser, target).then((chatId) => {
        setActiveChatId(chatId);
      });
    } else {
      setActiveChatId(target.id);
      setMessages([
        {
          id: 'init_1',
          senderId: target.id,
          text: `Halo! Salam kenal ya. Senang bisa terhubung di platform PMI 😊`,
          createdAt: new Date().toISOString(),
          time: 'Baru saja',
          seen: true,
        },
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChatId) return;

    const textToSend = inputText.trim();
    setInputText('');

    if (currentUser?.uid) {
      try {
        await sendChatMessage(activeChatId, currentUser.uid, textToSend, activeRecipient?.name);
      } catch (err) {
        console.error('Error sending message:', err);
      }
    } else {
      // Local fallback
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderId: 'me',
        text: textToSend,
        createdAt: new Date().toISOString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        seen: true,
      };
      setMessages((prev) => [...prev, newMsg]);

      // Auto reply demo
      setTimeout(() => {
        const replyMsg: ChatMessage = {
          id: `reply_${Date.now()}`,
          senderId: activeRecipient?.id || 'target',
          text: 'Alhamdulillah, terima kasih banyak ya! Semangat selalu dan jaga kesehatan di sana ✨',
          createdAt: new Date().toISOString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seen: true,
        };
        setMessages((prev) => [...prev, replyMsg]);
      }, 1200);
    }
  };

  // If a chat conversation is actively opened:
  if (activeChatId && activeRecipient) {
    return (
      <div id="chat-conversation-view" className="flex flex-col h-[calc(100vh-140px)] bg-slate-50">
        {/* Chat Active Header */}
        <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setActiveChatId(null);
                setActiveRecipient(null);
              }}
              className="p-1 rounded-full text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="relative">
              <img
                src={activeRecipient.avatar}
                alt={activeRecipient.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100"
              />
              {activeRecipient.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="text-xs font-bold text-slate-800">{activeRecipient.name}</h3>
                {activeRecipient.isVerified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-[10px] text-emerald-600 font-medium">Sedang Online</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Panggilan suara terenkripsi ke ' + activeRecipient.name)}
              className="p-2 rounded-full text-purple-600 hover:bg-purple-50 cursor-pointer"
            >
              <Phone size={18} />
            </button>
            <button
              onClick={() => alert('Panggilan video terenkripsi ke ' + activeRecipient.name)}
              className="p-2 rounded-full text-purple-600 hover:bg-purple-50 cursor-pointer"
            >
              <Video size={18} />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar">
          {/* Security Notice */}
          <div className="p-2.5 bg-purple-50/80 rounded-2xl border border-purple-100 text-center text-[11px] text-purple-800">
            <ShieldCheck size={14} className="inline mr-1 text-purple-600" />
            Percakapan ini terenkripsi real-time via Cloud Firestore. Jaga keamanan data pribadi Anda.
          </div>

          {messages.map((msg) => {
            const isMe = currentUser ? msg.senderId === currentUser.uid : msg.senderId === 'me';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                  {msg.time}
                  {isMe && <CheckCheck size={12} className="text-purple-600" />}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ketik pesan hangat..."
            className="flex-1 bg-slate-50 border border-slate-200 text-xs sm:text-sm px-4 py-2.5 rounded-full focus:outline-none focus:border-purple-600"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Conversation List View
  return (
    <div id="chat-list-view" className="space-y-3 px-4 py-3 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-heading">
            Pesan & Sahabat
          </h1>
          <p className="text-xs text-slate-500">Percakapan pribadi dengan koneksi terpercaya</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari teman atau percakapan..."
          className="w-full bg-slate-100 border-none text-xs pl-9 pr-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        />
      </div>

      {/* Realtime Chats List */}
      <div className="space-y-2 pt-1">
        {(() => {
          const list = conversations.map((c) => {
            const otherUid = c.participants.find((p) => p !== currentUser?.uid) || '';
            const details = c.participantDetails?.[otherUid] || {
              name: 'Sahabat PMI',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
              isVerified: true,
              online: true,
              role: 'Sahabat Rekan Migran',
            };
            return {
              id: c.id,
              targetId: otherUid || c.id,
              name: details.name,
              avatar: details.avatar,
              isVerified: details.isVerified,
              online: details.online,
              role: details.role,
              lastMessage: c.lastMessage || 'Percakapan dimulai',
              time: c.lastMessageAt
                ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Baru saja',
            };
          });

          const filtered = list.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filtered.length === 0) {
            return (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs space-y-1">
                <p className="text-sm font-bold text-slate-700">Belum ada percakapan.</p>
                <p className="text-xs text-slate-400">Mulai sapa teman atau temukan match baru di tab Match ❤️</p>
              </div>
            );
          }

          return filtered.map((c) => (
            <div
              key={c.id}
              onClick={() =>
                handleOpenConversation({
                  id: c.targetId,
                  name: c.name,
                  avatar: c.avatar,
                  isVerified: c.isVerified,
                  online: c.online,
                  role: c.role,
                })
              }
              className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:border-purple-200 hover:bg-purple-50/30 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100"
                  />
                  {c.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800">{c.name}</h3>
                    {c.isVerified && <VerifiedBadge size="sm" />}
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-[200px] mt-0.5">
                    {c.lastMessage}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">{c.time}</span>
                <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-1.5" />
              </div>
            </div>
          ));
        })()}
      </div>
    </div>
  );
};
