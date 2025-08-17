"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import ChatSidebar from "@/components/chat-sidebar";
import ChatWindow from "@/components/chat-window";
import { getAuthToken } from "@/lib/getToken";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Chatroom {
  _id: string;
  name: string;
  description: string;
  users: any[];
  isPrivate: boolean;
  createdBy: string;
  maxMembers: number;
  lastMessage?: {
    content: string;
    timestamp: Date;
    sender: {
      name: string;
      username: string;
    };
  };
  unreadCount?: number;
}

function ChatPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [selectedChatroom, setSelectedChatroom] = useState<Chatroom | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setShowSidebar(window.innerWidth >= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!userLoading && !user?.email) {
      router.push("/auth/login");
    }
  }, [user, userLoading]);

  const fetchChatrooms = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch("/api/chatrooms/join", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (response.ok) {
        setChatrooms(data.chatrooms || []);

        const roomId = searchParams.get("roomId");
        if (roomId && data.chatrooms) {
          const targetChatroom = data.chatrooms.find(
            (room: Chatroom) => room._id === roomId
          );
          if (targetChatroom) {
            setSelectedChatroom(targetChatroom);
            if (isMobile) {
              setShowSidebar(false);
            }
          }
        }
      } else {
        toast.error(data.message || "Failed to fetch chatrooms");
      }
    } catch (error) {
      toast.error("An error occurred while fetching chatrooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchChatrooms();
    }
  }, [user]);

  const handleChatroomSelect = (chatroom: Chatroom) => {
    setSelectedChatroom(chatroom);

    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("roomId", chatroom._id);
    router.replace(`/chat?${newSearchParams.toString()}`, { scroll: false });

    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBackToSidebar = () => {
    if (isMobile) {
      setShowSidebar(true);
      setSelectedChatroom(null);

      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("roomId");
      const newUrl = newSearchParams.toString()
        ? `/chat?${newSearchParams.toString()}`
        : "/chat";
      router.replace(newUrl, { scroll: false });
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? showSidebar
              ? "w-full"
              : "hidden"
            : "w-80 border-r border-gray-200 dark:border-gray-700"
        } bg-white dark:bg-gray-800 flex flex-col`}
      >
        <ChatSidebar
          chatrooms={chatrooms}
          selectedChatroom={selectedChatroom}
          onChatroomSelect={handleChatroomSelect}
          onRefresh={fetchChatrooms}
          user={user}
        />
      </div>

      {/* Chat Window */}
      <div
        className={`${
          isMobile ? (showSidebar ? "hidden" : "w-full") : "flex-1"
        } flex flex-col`}
      >
        {selectedChatroom ? (
          <ChatWindow
            chatroom={selectedChatroom}
            user={user}
            onBack={handleBackToSidebar}
            isMobile={isMobile}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 md:hidden"> // hidden on mobile
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-8 opacity-20">
                <svg viewBox="0 0 303 172" className="w-full h-full">
                  <defs>
                    <linearGradient id="a" x1="50%" x2="50%" y1="100%" y2="0%">
                      <stop
                        offset="0%"
                        stopColor="#1fa2f3"
                        stopOpacity=".7"
                      ></stop>
                      <stop
                        offset="100%"
                        stopColor="#12d886"
                        stopOpacity=".7"
                      ></stop>
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#a)"
                    d="M229.221 12.739c25.142 0 45.521 20.379 45.521 45.521v55.953c0 25.142-20.379 45.521-45.521 45.521H73.779c-25.142 0-45.521-20.379-45.521-45.521V58.26c0-25.142 20.379-45.521 45.521-45.521h155.442z"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-light text-gray-500 dark:text-gray-400 mb-2">
                RoomTalk
              </h2>
              <p className="text-gray-400 dark:text-gray-500 max-w-md">
                Send and receive messages without keeping your phone online. Use
                RoomTalk on up to 4 linked devices and 1 phone at the same time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const ChatPageApp = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPage />
    </Suspense>
  );
};

export default ChatPageApp;
