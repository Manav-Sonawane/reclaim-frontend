'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { io, Socket } from 'socket.io-client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Send, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get('itemId');
  const chatIdParam = searchParams.get('chatId');
  const { user } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chats, setChats] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeChat, setActiveChat] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);

  // Initialize Socket
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch Chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await api.get('/chats');
        setChats(data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    if (user) fetchChats();
  }, [user]);

  // Handle ItemId param (Create/Get Chat)
  useEffect(() => {
    const initChat = async () => {
      if (itemId && user && !processingRef.current) {
        processingRef.current = true;
        try {
          const { data } = await api.post('/chats', { itemId });
          setChats(prev => {
             if (!prev.find(c => c._id === data._id)) {
                 return [data, ...prev];
             }
             return prev;
          });
          setActiveChat(data);
        } catch (error) {
          toast.error('Failed to start chat');
        } finally {
            // Optional: reset ref if you want to allow re-trying, 
            // but for itemId param we typically only need to do this once per mount/param change.
            // Keeping it true prevents double-firing.
            setTimeout(() => { processingRef.current = false; }, 1000);
        }
      }
    };
    initChat();
  }, [itemId, user]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  // Join Room & Listen
  useEffect(() => {
    if (socket && activeChat) {
      socket.emit('join_room', activeChat._id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if ((activeChat.messages || []).length > 0) {
         setMessages(activeChat.messages);
      }

      const handleMessage = (msg: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        setMessages(prev => [...prev, msg]);
      };

      socket.on('receive_message', handleMessage);

      return () => {
        socket.off('receive_message', handleMessage);
      };
    }
  }, [socket, activeChat]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !activeChat) return;

    const msgData = {
      chatId: activeChat._id,
      senderId: user?._id,
      text: newMessage
    };

    socket.emit('send_message', msgData);
    setNewMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-5rem)] flex gap-6">
      {/* Sidebar */}
      <Card className="w-1/3 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-bold text-lg">
          Messages
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             const otherParticipant = chat.participants.find((p: any) => p._id !== user?._id);
             return (
               <div 
                 key={chat._id}
                 onClick={() => setActiveChat(chat)}
                 className={`p-4 border-b border-gray-100 dark:border-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${activeChat?._id === chat._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
               >
                 <div className="font-semibold">{otherParticipant?.name || 'Unknown User'}</div>
                 <div className="text-sm text-gray-500 truncate">{chat.item?.title}</div>
               </div>
             );
          })}
          {chats.length === 0 && <div className="p-4 text-center text-gray-500">No conversations yet</div>}
        </div>
      </Card>

      {/* Chat Window */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {activeChat ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
               <div className="font-bold flex items-center gap-2">
                 <UserIcon className="w-5 h-5" />
                 {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                 {activeChat.participants.find((p: any) => p._id !== user?._id)?.name}
               </div>
               <div className="text-sm text-gray-500">
                 Item: {activeChat.item?.title}
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-black">
              {messages.map((msg, idx) => {
                const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <p>{msg.text || msg.content}</p>
                      <span className="text-xs opacity-70 block text-right mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-2">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button onClick={sendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
