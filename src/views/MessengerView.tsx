import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Check, CheckCheck, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface ChatContact {
  id: string;
  name: string;
  parish: string;
  avatar: string;
}

const CONTACTS: ChatContact[] = [
  {
    id: 'user-1',
    name: 'Fr. Seraphim Rose',
    parish: 'St. Herman Monastery',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'user-2',
    name: 'Eleni Chrysostom',
    parish: 'Holy Trinity Cathedral',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'user-3',
    name: 'Deacon Markos',
    parish: 'St. George Antiochian',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'user-4',
    name: 'Anna Papadopoulos',
    parish: 'St. Nicholas Church',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  },
];

interface MessengerViewProps {
  initialContactId?: string;
}

export const MessengerView: React.FC<MessengerViewProps> = ({ initialContactId }) => {
  const { profile } = useAuth();
  const { t } = useTheme();

  const [activeContact, setActiveContact] = useState<ChatContact>(
    CONTACTS.find((c) => c.id === initialContactId) || CONTACTS[0]
  );
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender_id: activeContact.id,
      receiver_id: profile?.id || 'me',
      content: 'Christ is in our midst! Welcome to OrthodoxConnect.',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'msg-2',
      sender_id: profile?.id || 'me',
      receiver_id: activeContact.id,
      content: 'He is and shall ever be! Thank you Father/Sister for the warm fellowship.',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [inputContent, setInputContent] = useState('');

  // Sync messages from Supabase or memory
  useEffect(() => {
    fetchMessages();
  }, [activeContact.id]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${activeContact.id},receiver_id.eq.${activeContact.id}`)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        setMessages(data);
      }
    } catch (err) {
      console.warn('Supabase messages fallback:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      sender_id: profile?.id || 'me',
      receiver_id: activeContact.id,
      content: inputContent.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputContent('');

    try {
      await supabase.from('messages').insert([
        {
          sender_id: newMsg.sender_id,
          receiver_id: newMsg.receiver_id,
          content: newMsg.content,
        },
      ]);
    } catch (err) {
      console.warn('Message send warning:', err);
    }
  };

  return (
    <div className="bg-stone-950/80 border border-amber-900/30 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col md:flex-row h-[600px]">
      {/* Left Contact List */}
      <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-amber-900/30 flex flex-col bg-stone-950/90">
        <div className="p-4 border-b border-amber-900/30">
          <h3 className="font-serif font-bold text-sm text-amber-100 flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>{t('messages')}</span>
          </h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-stone-900 border border-amber-900/30 text-amber-100 placeholder-stone-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {CONTACTS.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setActiveContact(contact)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                contact.id === activeContact.id
                  ? 'bg-amber-600/20 text-amber-100 border border-amber-500/40'
                  : 'hover:bg-stone-900 text-stone-300'
              }`}
            >
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-9 h-9 rounded-full object-cover border border-amber-500/30 shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-amber-100 truncate">{contact.name}</p>
                <p className="text-[10px] text-stone-400 truncate">{contact.parish}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Chat Stage */}
      <div className="flex-1 flex flex-col bg-stone-950/60">
        {/* Chat Active Header */}
        <div className="p-4 border-b border-amber-900/30 flex items-center gap-3 bg-stone-950">
          <img
            src={activeContact.avatar}
            alt={activeContact.name}
            className="w-9 h-9 rounded-full object-cover border border-amber-500/40 shrink-0"
          />
          <div>
            <h4 className="font-serif font-bold text-sm text-amber-100">
              {activeContact.name}
            </h4>
            <p className="text-[10px] text-amber-400">{activeContact.parish}</p>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg) => {
            const isMe = msg.sender_id === (profile?.id || 'me');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs leading-relaxed shadow-md ${
                    isMe
                      ? 'bg-amber-600 text-stone-950 font-medium rounded-br-none'
                      : 'bg-stone-900 border border-amber-900/30 text-amber-100 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] text-stone-500 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-amber-900/30 bg-stone-950 flex gap-2">
          <input
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder={t('typeMessage')}
            className="flex-1 p-2.5 rounded-xl bg-stone-900 border border-amber-900/30 text-xs text-amber-100 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t('send')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
