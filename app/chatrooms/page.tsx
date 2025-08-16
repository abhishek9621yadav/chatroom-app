"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import ChatroomCard from "@/components/ChatroomCard";
import CreateChatroomModal from "@/components/CreateChatroomModal";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { getAuthToken } from "@/lib/getToken";

export default function ChatroomsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [chatrooms, setChatrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPrivate, setFilterPrivate] = useState<boolean | null>(null);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 10,
    hasMore: true,
  });

  useEffect(() => {
    if (!userLoading && !user?.email) {
      router.push("/auth/login");
    }
  }, [user, userLoading]);

  const fetchChatrooms = async (reset = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        skip: reset ? "0" : pagination.skip.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery) params.set("name", searchQuery);
      if (filterPrivate !== null)
        params.set("isPrivate", filterPrivate.toString());

      const token = getAuthToken();
      const response = await fetch(`/api/chatrooms?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (response.ok) {
        setChatrooms((prev) =>
          reset ? data.chatrooms : [...prev, ...data.chatrooms]
        );
        setPagination((prev) => ({
          ...prev,
          skip: reset ? 0 : prev.skip + prev.limit,
          hasMore: data.chatrooms.length === prev.limit,
        }));
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
      fetchChatrooms(true);
    }
  }, [user, searchQuery, filterPrivate]);

  const handleCreateSuccess = (newChatroom: any) => {
    setChatrooms((prev) => [newChatroom, ...prev]);
    setShowCreateModal(false);
    toast.success("Chatroom created successfully!");
  };

  const handleJoinChatroom = async (chatroomId: string, password?: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/chatrooms/join/${chatroomId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("Successfully joined the chatroom!");
        router.push(`/chatrooms/${chatroomId}`);
      } else {
        toast.error(data.message || "Failed to join chatroom");
      }
    } catch (error) {
      toast.error("An error occurred while joining the chatroom");
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Chatrooms
        </h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search chatrooms..."
          />
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Chatroom
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          variant={filterPrivate === null ? "default" : "outline"}
          onClick={() => setFilterPrivate(null)}
        >
          All
        </Button>
        <Button
          variant={filterPrivate === true ? "default" : "outline"}
          onClick={() => setFilterPrivate(true)}
        >
          Private
        </Button>
        <Button
          variant={filterPrivate === false ? "default" : "outline"}
          onClick={() => setFilterPrivate(false)}
        >
          Public
        </Button>
      </div>

      {loading && chatrooms.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : chatrooms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No chatrooms found</p>
          <Button
            variant="link"
            className="mt-4"
            onClick={() => setShowCreateModal(true)}
          >
            Create your first chatroom
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatrooms.map((chatroom) => (
            <ChatroomCard
              key={chatroom._id}
              chatroom={chatroom}
              onJoin={handleJoinChatroom}
              currentUserId={user?._id}
            />
          ))}
        </div>
      )}

      {pagination.hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={() => fetchChatrooms()}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Load More
          </Button>
        </div>
      )}

      <CreateChatroomModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateSuccess={handleCreateSuccess}
      />
    </div>
  );
}
