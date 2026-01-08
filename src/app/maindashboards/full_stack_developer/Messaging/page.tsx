"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send,
  Search,
  Clock,
  CheckCircle,
  CheckCheck,
  Paperclip,
  Smile,
  MoreVertical,
  Star,
  Trash2,
  Archive,
  Eye,
  Users,
  MessageSquare,
  UserPlus,
  Circle,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  is_active?: boolean;
  is_verified?: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_email: string;
  receiver_id: string;
  receiver_email: string;
  subject: string;
  message: string;
  message_type: string;
  status: 'sent' | 'delivered' | 'read' | 'archived' | 'deleted';
  is_important: boolean;
  is_starred: boolean;
  read_at: string | null;
  created_at: string;
  sender?: {
    name: string;
    avatar_url?: string;
  };
  receiver?: {
    name: string;
    avatar_url?: string;
  };
}

interface Conversation {
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function MessagingSystem() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'conversations'>('all');
  const [sending, setSending] = useState(false);

  // Fetch current user and available users
  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    fetchConversations();
  }, []);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.users) {
        // Filter out current user from the list
        const filteredUsers = data.users.filter((user: User) => 
          user.id !== currentUser?.id
        );
        setUsers(filteredUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      if (data.conversations) {
        setConversations(data.conversations);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/messages?conversationWith=${userId}`);
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedUser || !newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: selectedUser.id,
          receiver_email: selectedUser.email,
          subject: subject,
          message: newMessage,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [data.message, ...prev]);
        setNewMessage('');
        setSubject('');
        fetchConversations(); // Refresh conversations list
        
        // If this user wasn't in conversations, add them
        if (!conversations.some(conv => conv.user_id === selectedUser.id)) {
          setConversations(prev => [{
            user_id: selectedUser.id,
            name: selectedUser.name,
            email: selectedUser.email,
            avatar_url: selectedUser.avatar_url,
            last_message: newMessage,
            last_message_time: new Date().toISOString(),
            unread_count: 0
          }, ...prev]);
        }
      } else {
        console.error('Error sending message:', data.error);
        alert(`Failed to send message: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const startNewChat = (user: User) => {
    setSelectedUser(user);
    setMessages([]);
    setActiveTab('conversations');
  };

  const markAsRead = async (messageId: string) => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          status: 'read'
        }),
      });
      
      // Update local message status
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));
      
      // Update conversations unread count
      if (selectedUser) {
        setConversations(prev => prev.map(conv =>
          conv.user_id === selectedUser.id 
            ? { ...conv, unread_count: Math.max(0, conv.unread_count - 1) }
            : conv
        ));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString();
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  // Get users who have conversations
  const usersWithConversations = conversations.map(conv => conv.user_id);
  
  // Filter users based on search and active tab
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'conversations') {
      return matchesSearch && usersWithConversations.includes(user.id);
    }
    
    return matchesSearch;
  });

  // Get unread count for a specific user
  const getUserUnreadCount = (userId: string) => {
    const conversation = conversations.find(conv => conv.user_id === userId);
    return conversation?.unread_count || 0;
  };

  // Check if user is active (online status based on last_login)
  const isUserActive = (user: User) => {
    if (!user.last_login) return false;
    const lastLogin = new Date(user.last_login);
    const now = new Date();
    const diffHours = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
    return diffHours < 24; // Consider active if logged in within last 24 hours
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-xl border border-gray-200">
      {/* Users List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <Badge className="bg-blue-100 text-blue-800">
              {conversations.reduce((sum, conv) => sum + conv.unread_count, 0)} unread
            </Badge>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, or role..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
              <TabsTrigger value="conversations">Chats ({conversations.length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          {loadingUsers ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 p-4">
              {activeTab === 'conversations' ? (
                <>
                  <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-center">No conversations yet</p>
                  <p className="text-sm text-gray-400 text-center mt-1">
                    Start a chat with someone from the "All Users" tab
                  </p>
                </>
              ) : (
                <>
                  <Users className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-center">No users found</p>
                  <p className="text-sm text-gray-400 text-center mt-1">
                    {searchQuery ? 'Try a different search term' : 'No users in the system'}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const unreadCount = getUserUnreadCount(user.id);
                const hasConversation = usersWithConversations.includes(user.id);
                const conversation = conversations.find(conv => conv.user_id === user.id);
                const isActive = isUserActive(user);
                
                return (
                  <div
                    key={user.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                      selectedUser?.id === user.id 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'hover:border-l-4 hover:border-blue-200'
                    }`}
                    onClick={() => startNewChat(user)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {isActive && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                            )}
                            {hasConversation && conversation && (
                              <span className="text-xs text-gray-500">
                                {formatRelativeTime(conversation.last_message_time)}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                        
                        {user.phone && (
                          <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </p>
                        )}
                        
                        {hasConversation && conversation ? (
                          <div className="mt-1">
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.last_message.length > 50
                                ? conversation.last_message.substring(0, 50) + '...'
                                : conversation.last_message}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 mt-1">
                            <UserPlus className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">Click to start chat</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedUser.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-white">
                        {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isUserActive(selectedUser) && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{selectedUser.name}</h3>
                      <Badge className="bg-blue-100 text-blue-800">
                        {selectedUser.role}
                      </Badge>
                      {isUserActive(selectedUser) && (
                        <Badge className="bg-green-100 text-green-800">
                          <Circle className="h-2 w-2 fill-current mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {selectedUser.email}
                    </p>
                    {selectedUser.phone && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedUser.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">View Profile</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Star Conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-white to-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl mb-6">
                    <MessageSquare className="h-24 w-24 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Start a conversation</h3>
                  <p className="text-center max-w-md text-gray-600 mb-8">
                    You haven't messaged {selectedUser.name} yet. Send your first message to start chatting!
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-md mb-8">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewMessage('Hello! How are you doing today?');
                        const textarea = document.querySelector('textarea');
                        textarea?.focus();
                      }}
                      className="hover:bg-blue-50"
                    >
                      👋 Say hello
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewMessage('I wanted to discuss a project with you.');
                        const textarea = document.querySelector('textarea');
                        textarea?.focus();
                      }}
                      className="hover:bg-blue-50"
                    >
                      💼 Discuss project
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewMessage('Can we schedule a quick call?');
                        const textarea = document.querySelector('textarea');
                        textarea?.focus();
                      }}
                      className="hover:bg-blue-50"
                    >
                      📅 Schedule call
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewMessage('Thanks for your help!');
                        const textarea = document.querySelector('textarea');
                        textarea?.focus();
                      }}
                      className="hover:bg-blue-50"
                    >
                      🙏 Say thanks
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pb-4">
                  {messages.map((message, index) => {
                    const isCurrentUserSender = message.sender_id === currentUser?.id;
                    const showDate = index === 0 || 
                      formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);

                    // Auto-mark as read when viewing
                    if (!isCurrentUserSender && message.status === 'sent') {
                      setTimeout(() => markAsRead(message.id), 500);
                    }

                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-6">
                            <Badge variant="outline" className="px-4 py-1 bg-white">
                              {formatDate(message.created_at)}
                            </Badge>
                          </div>
                        )}

                        <div className={`flex ${isCurrentUserSender ? 'justify-end' : 'justify-start'} mb-2`}>
                          <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                            isCurrentUserSender
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                          }`}>
                            {!isCurrentUserSender && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{message.sender?.name || 'Unknown'}</span>
                                <span className="text-xs opacity-75">
                                  {formatTime(message.created_at)}
                                </span>
                              </div>
                            )}
                            <p className="whitespace-pre-wrap break-words">{message.message}</p>
                            <div className="flex items-center justify-end gap-1 mt-2">
                              <span className="text-xs opacity-75">
                                {isCurrentUserSender ? formatTime(message.created_at) : ''}
                              </span>
                              {isCurrentUserSender && (
                                <div className="ml-1">
                                  {message.status === 'read' ? (
                                    <CheckCheck className="h-3 w-3 text-blue-200" />
                                  ) : message.status === 'delivered' ? (
                                    <CheckCircle className="h-3 w-3 text-blue-200" />
                                  ) : (
                                    <CheckCircle className="h-3 w-3 opacity-50" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="space-y-3">
                <Input
                  placeholder="Subject (optional)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="border-gray-300"
                />
                <div className="relative">
                  <Textarea
                    placeholder={`Message ${selectedUser.name}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[100px] pr-24 border-gray-300 resize-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    maxLength={2000}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                      title="Attach file"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                      title="Emoji"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <span>{newMessage.length}/2000</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl mb-6">
              <MessageSquare className="h-24 w-24 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Select a user to start messaging</h2>
            <p className="text-center max-w-md text-gray-600 mb-8">
              Choose a user from the list on the left to begin a conversation. You can send messages, share files, and collaborate seamlessly.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-lg mx-auto mb-2 w-fit">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium">Real-time</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-green-100 rounded-lg mx-auto mb-2 w-fit">
                  <CheckCheck className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium">Read receipts</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-purple-100 rounded-lg mx-auto mb-2 w-fit">
                  <Paperclip className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium">File sharing</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}