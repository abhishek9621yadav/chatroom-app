"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Plus,
  MoreVertical,
  MessageSquare,
  Settings,
  Users,
  Archive,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateChatroomModal from "./CreateChatroomModal";
import { formatTime } from "@/utils/formatTime";

interface ChatSidebarProps {
  chatrooms: any[];
  selectedChatroom: any;
  onChatroomSelect: (chatroom: any) => void;
  onRefresh: () => void;
  user: any;
}

export default function ChatSidebar({
  chatrooms,
  selectedChatroom,
  onChatroomSelect,
  onRefresh,
  user,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredChatrooms = chatrooms.filter((chatroom) =>
    chatroom.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSuccess = (newChatroom: any) => {
    onRefresh();
    setShowCreateModal(false);
    onChatroomSelect(newChatroom);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatarUrl || "/placeholder.svg"} />
          <AvatarFallback className="bg-green-500 text-white">
            {user?.name?.charAt(0) || user?.username?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-gray-600 dark:text-gray-400"
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-gray-600 dark:text-gray-400"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-gray-600 dark:text-gray-400"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Group
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="mr-2 h-4 w-4" />
                Archived
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 bg-white dark:bg-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-100 dark:bg-gray-700 border-none"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {filteredChatrooms.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? "No chats found" : "No chats yet"}
              </p>
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(true)}
                className="mx-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Start a chat
              </Button>
            </div>
          ) : (
            filteredChatrooms.map((chatroom) => (
              <div
                key={chatroom._id}
                onClick={() => onChatroomSelect(chatroom)}
                className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                  selectedChatroom?._id === chatroom._id
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }`}
              >
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={chatroom.imageUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gray-300 dark:bg-gray-600">
                    {chatroom.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {chatroom.name}
                    </h3>
                    {chatroom.lastMessage && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(chatroom.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {chatroom.lastMessage
                        ? `${chatroom.lastMessage.sender.name}: ${chatroom.lastMessage.content}`
                        : chatroom.description}
                    </p>
                    {chatroom.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {chatroom.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <CreateChatroomModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateSuccess={handleCreateSuccess}
      />
    </>
  );
}
