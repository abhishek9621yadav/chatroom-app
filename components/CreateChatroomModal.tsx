"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/getToken";

interface CreateChatroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSuccess: (chatroom: any) => void;
}

export default function CreateChatroomModal({
  open,
  onOpenChange,
  onCreateSuccess,
}: CreateChatroomModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
    password: "",
    maxMembers: 50,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getAuthToken();
      const response = await fetch("/api/chatrooms", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onCreateSuccess(data.chatroom);
      } else {
        toast.error(data.message || "Failed to create chatroom");
      }
    } catch (error) {
      toast.error("An error occurred while creating the chatroom");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Chatroom</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new chatroom.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Chatroom name"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="What's this chatroom about?"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="maxMembers">Max Members</Label>
            <Input
              id="maxMembers"
              name="maxMembers"
              type="number"
              min="2"
              max="1025"
              value={formData.maxMembers}
              onChange={handleChange}
              className="w-24"
            />
          </div>
          <div className="flex items-center gap-4">
            <Switch
              id="isPrivate"
              checked={formData.isPrivate}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isPrivate: checked }))
              }
            />
            <Label htmlFor="isPrivate">Private Chatroom</Label>
          </div>
          {formData.isPrivate && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={formData.isPrivate}
                placeholder="Set a password"
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Chatroom"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
