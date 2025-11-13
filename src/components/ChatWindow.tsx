import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
}

interface Chat {
  chatId: number;
  otherUserId: number;
  otherUserName: string;
  otherUserImage: string;
  lastMessage: string;
  lastMessageTime: string;
}

interface ChatWindowProps {
  currentUserId: number;
  onClose?: () => void;
}

const API_URL = 'https://functions.poehali.dev/90308d0d-3ba1-4110-bc68-8468966811bb';

export default function ChatWindow({ currentUserId, onClose }: ChatWindowProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadChats();
  }, [currentUserId]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.chatId);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      const response = await fetch(`${API_URL}?action=list&userId=${currentUserId}`);
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const response = await fetch(`${API_URL}?action=messages&chatId=${chatId}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          chatId: selectedChat?.chatId,
          user1Id: currentUserId.toString(),
          user2Id: selectedChat?.otherUserId.toString(),
          senderId: currentUserId.toString(),
          content: newMessage,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setNewMessage('');
        await loadMessages(data.chatId);
        await loadChats();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      <Card className="w-80 p-4 bg-card/50 backdrop-blur-sm animate-fade-in flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Чаты</h3>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={18} />
            </Button>
          )}
        </div>
        
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {chats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="MessageCircle" size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Нет активных чатов</p>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.chatId}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedChat?.chatId === chat.chatId
                      ? 'bg-primary/20 border border-primary'
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={chat.otherUserImage} />
                      <AvatarFallback>{chat.otherUserName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{chat.otherUserName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {chat.lastMessage || 'Начните беседу'}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur-sm animate-fade-in">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedChat.otherUserImage} />
                <AvatarFallback>{selectedChat.otherUserName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedChat.otherUserName}</h3>
                <p className="text-xs text-muted-foreground">В сети</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.senderId === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Напишите сообщение..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !newMessage.trim()}
                  size="icon"
                >
                  <Icon name="Send" size={18} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <Icon name="MessageCircle" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Выберите чат</h3>
              <p className="text-muted-foreground">
                Выберите беседу из списка или начните новую
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}