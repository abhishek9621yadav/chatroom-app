"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Users, MessageSquare } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ChatroomCardProps {
  chatroom: any;
  onJoin: (chatroomId: string, password?: string) => void;
  currentUserId?: string;
}

export default function ChatroomCard({
  chatroom,
  onJoin,
  currentUserId,
}: ChatroomCardProps) {
  const [password, setPassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const router = useRouter();
  const isMember = chatroom.users.some(
    (user: any) => user === currentUserId
  );
  console.log("Chatroom Card Rendered", isMember, chatroom.users, currentUserId);
  const handleJoinClick = () => {
    if (chatroom.isPrivate) {
      setShowPasswordDialog(true);
    } else {
      onJoin(chatroom._id);
    }
  };

  const handleSubmitPassword = () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }
    onJoin(chatroom._id, password);
    setShowPasswordDialog(false);
    setPassword("");
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={chatroom.imageUrl || "/default-chatroom.png"} />
            <AvatarFallback>{chatroom.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>{chatroom.name}</CardTitle>
              {chatroom.isPrivate && (
                <Lock className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <CardDescription className="mt-1 line-clamp-2">
              {chatroom.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>
                {chatroom.users.length}/{chatroom.maxMembers}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{chatroom.messageCount || 0} messages</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          {isMember ? (
            <Button onClick={() => router.push(`/chat?roomId=${chatroom._id}`)}>
              Enter Chatroom
            </Button>
          ) : (
            <Button onClick={handleJoinClick}>Join Chatroom</Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Password</DialogTitle>
            <DialogDescription>
              This is a private chatroom. Please enter the password to join.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitPassword}>Join</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
