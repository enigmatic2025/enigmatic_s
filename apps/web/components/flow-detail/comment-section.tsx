"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    initials: string;
  };
  content: string;
  timestamp: string;
}

import { cn } from "@/lib/utils";

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  className?: string;
}

export function CommentSection({ comments, onAddComment, className }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment("");
  };

  return (
    <div className={cn("mt-4 space-y-4 border-t pt-4", className)}>
      <h4 className="text-sm font-semibold">Comments ({comments.length})</h4>
      
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 text-sm">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.avatar} />
              <AvatarFallback>{comment.author.initials}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{comment.author.name}</span>
                <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
              </div>
              <p className="text-muted-foreground">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No comments yet.</p>
        )}
      </div>

      <div className="flex gap-2 items-start">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
      </div>
    </div>
  );
}
