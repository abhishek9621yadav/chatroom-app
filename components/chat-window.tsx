"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Send,
  Mic,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAuthToken } from "@/lib/getToken";
import { toast } from "sonner";

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  timestamp: Date;
  type: "text" | "file" | "system";
  isEdited: boolean;
}

interface ChatWindowProps {
  chatroom: any;
  user: any;
  onBack: () => void;
  isMobile: boolean;
}

export default function ChatWindow({
  chatroom,
  user,
  onBack,
  isMobile,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  let socket: Socket;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket = io({ path: "/api/socketio", transports: ["polling"] });

    // Join current chatroom
    socket.emit("joinroom", chatroom._id);

    // Listen for incoming messages
    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for typing events
    socket.on("typing", (userId) => {
      setTypingUsers((prev) => [...prev, userId]);
      toast.info(`${userId} is typing...`, {
        duration: 2000,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [chatroom._id]);

  const fetchMessages = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/chatrooms/messages/${chatroom._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (response.ok) {
        markMessagesAsSeen();
        setMessages(data.messages || []);
      } else {
        toast.error(data.message || "Failed to fetch messages");
      }
    } catch (error) {
      toast.error("An error occurred while fetching messages");
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsSeen = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `/api/chatrooms/messages/${chatroom._id}/seen`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        // toast.success("Messages marked as seen");
      } else {
        // toast.error(data.message || "Failed to mark messages as seen");
      }
    } catch (error) {
      toast.error("An error occurred while marking messages as seen");
    }
  };

  useEffect(() => {
    if (chatroom._id) {
      setLoading(true);
      fetchMessages();
    }
  }, [chatroom._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      markMessagesAsSeen();
      const token = getAuthToken();
      const response = await fetch(`/api/chatrooms/messages/${chatroom._id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageContent,
          type: "text",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        toast.error(data.message || "Failed to send message");
        setNewMessage(messageContent);
      }
      // Emit message to the server
      socket.emit("sendMessage", {
        roomId: chatroom._id,
        message: {
          content: messageContent,
          type: "text",
        },
      });
    } catch (error) {
      toast.error("An error occurred while sending message");
      setNewMessage(messageContent);
    }
  };

  const formatTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const dateKey = new Date(message.timestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups).map(([date, msgs]) => ({
      date: new Date(date),
      messages: msgs,
    }));
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={chatroom.imageUrl || "/placeholder.svg"} />
          <AvatarFallback className="bg-gray-300 dark:bg-gray-600">
            {chatroom.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="font-medium text-gray-900 dark:text-white truncate">
            {chatroom.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {chatroom.users.length} members
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 dark:text-gray-400"
          >
            <Video className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 dark:text-gray-400"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 dark:text-gray-400"
          >
            <Search className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-400"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Contact info</DropdownMenuItem>
              <DropdownMenuItem>Select messages</DropdownMenuItem>
              <DropdownMenuItem>Mute notifications</DropdownMenuItem>
              <DropdownMenuItem>Clear messages</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Delete chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : messageGroups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messageGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date separator */}
                <div className="flex justify-center my-4">
                  <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg text-xs text-gray-500 dark:text-gray-400 shadow-sm">
                    {formatDate(group.date)}
                  </span>
                </div>

                {/* Messages for this date */}
                {group.messages.map((message, index) => {
                  const isOwn = message.sender._id === user?._id;
                  const showAvatar =
                    !isOwn &&
                    (index === group.messages.length - 1 ||
                      group.messages[index + 1]?.sender._id !==
                        message.sender._id);

                  return (
                    <div
                      key={message._id}
                      className={`flex ${
                        isOwn ? "justify-end" : "justify-start"
                      } mb-2`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-xs lg:max-w-md ${
                          isOwn ? "flex-row-reverse" : ""
                        }`}
                      >
                        {showAvatar && !isOwn && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                message.sender.avatarUrl || "/placeholder.svg"
                              }
                            />
                            <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-xs">
                              {message.sender.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={`px-3 py-2 rounded-lg ${
                            isOwn
                              ? "bg-green-500 text-white"
                              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                              {message.sender.name}
                            </p>
                          )}
                          <p className="text-sm break-words">
                            {message.content}
                          </p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 ${
                              isOwn
                                ? "text-green-100"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            <span className="text-xs">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.isEdited && (
                              <span className="text-xs">edited</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-gray-600 dark:text-gray-400"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              className="pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {newMessage.trim() ? (
            <Button
              type="submit"
              size="icon"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-gray-400"
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
