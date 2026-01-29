import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Reply, ThumbsUp, Hash, AtSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  parent_id?: string;
  created_at: string;
  user_name: string;
  like_count?: number;
}

interface ActionFlowCommentsProps {
  actionFlowId: string;
  orgId: string; // Needed for creating comments
}

const fetcher = (url: string) => apiClient.get(url).then(res => {
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
});

export function ActionFlowComments({ actionFlowId, orgId }: ActionFlowCommentsProps) {
  const { data: comments = [], error, isLoading } = useSWR<Comment[]>(
    actionFlowId ? `/comments?action_flow_id=${actionFlowId}` : null,
    fetcher,
    {
      refreshInterval: 5000, 
      fallbackData: []
    }
  );

  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Error handling effect
  if (error) {
     console.error("SWR Error:", error);
  }

  const handlePostComment = async (parentId?: string, content?: string) => {
    const text = content || newComment;
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        org_id: orgId,
        action_flow_id: actionFlowId,
        content: text,
        parent_id: parentId,
      };

      const res = await apiClient.post("/comments", payload);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to post comment: ${res.status} ${errorText}`);
      }

      await res.json(); // Consume body
      
      // Mutate SWR cache to show new comment immediately
      await mutate(`/comments?action_flow_id=${actionFlowId}`); 
      
      // Cleanup
      if (parentId) {
        setReplyTo(null);
        setReplyContent("");
      } else {
        setNewComment("");
      }
      toast.success("Comment posted");
    } catch (e: any) {
      console.error("Post Comment Error:", e);
      toast.error(e.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Group comments by parent
  const rootComments = comments.filter(c => !c.parent_id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Newest first
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId).sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); // Oldest first for replies usually

  return (
    <div className="flex flex-col h-full">
         <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Discussion</h3>
            <span className="text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded-full border border-zinc-100 dark:border-zinc-800">
                Global Context
            </span>
        </div>

        {/* New Comment Input */}
        <div className="mb-4">
            <div className="flex flex-col gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 focus-within:border-zinc-900 dark:focus-within:border-zinc-100 transition-all">
                <Textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="border-0 bg-transparent min-h-[40px] p-0 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100 focus-visible:ring-0 resize-none"
                    placeholder="Comment on this workflow..."
                />
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                     <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                            <AtSign className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                            <Hash className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                    <Button 
                        size="sm" 
                        className="h-7 text-xs" 
                        disabled={submitting || !newComment.trim()}
                        onClick={() => handlePostComment()}
                    >
                        {submitting ? <Loader2 className="w-3 h-3 animate-spin"/> : <Send className="w-3 h-3 mr-1" />}
                        Post
                    </Button>
                </div>
            </div>
        </div>

        <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-6 pb-4">
                {isLoading ? (
                   <div className="flex justify-center py-4 text-zinc-400">
                       <Loader2 className="w-4 h-4 animate-spin" />
                   </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400 text-xs italic">
                        No comments yet. Start the conversation.
                    </div>
                ) : (
                    rootComments.map(comment => (
                        <CommentItem 
                          key={comment.id} 
                          comment={comment} 
                          replies={getReplies(comment.id)}
                          replyTo={replyTo}
                          setReplyTo={setReplyTo}
                          replyContent={replyContent}
                          setReplyContent={setReplyContent}
                          handlePostComment={handlePostComment}
                          submitting={submitting}
                        />
                    ))
                )}
            </div>
        </ScrollArea>
    </div>
  );
}

// Extracted Component
function CommentItem({ 
  comment, 
  isReply = false, 
  replies = [], 
  replyTo, 
  setReplyTo, 
  replyContent, 
  setReplyContent, 
  handlePostComment, 
  submitting 
}: { 
  comment: Comment, 
  isReply?: boolean, 
  replies?: Comment[], 
  replyTo: string | null, 
  setReplyTo: (id: string | null) => void, 
  replyContent: string, 
  setReplyContent: (v: string) => void, 
  handlePostComment: (parentId?: string, content?: string) => void, 
  submitting: boolean 
}) {
    const isReplying = replyTo === comment.id;

    return (
      <div className={`flex gap-3 ${isReply ? "mt-3 pl-8 border-l border-zinc-100 dark:border-zinc-800" : ""}`}>
        <Avatar className="h-6 w-6 mt-1">
             <AvatarImage />
             <AvatarFallback className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {comment.user_name ? comment.user_name.substring(0,2).toUpperCase() : "U"}
             </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{comment.user_name || "Unknown"}</span>
                <span className="text-[10px] text-zinc-400">
                    {new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
            
            <p className="text-sm text-zinc-800 dark:text-zinc-300 leading-snug whitespace-pre-wrap">
                {comment.content}
            </p>

            <div className="flex items-center gap-3 pt-1">
                <Button variant="ghost" size="sm" className="h-5 px-1 text-[10px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Like
                </Button>
                {!isReply && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 px-1 text-[10px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                        onClick={() => setReplyTo(isReplying ? null : comment.id)}
                    >
                        <Reply className="w-3 h-3 mr-1" />
                        Reply
                    </Button>
                )}
            </div>

            {/* Reply Input */}
            {isReplying && (
                <div className="mt-2 flex gap-2">
                    <Textarea 
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="min-h-[60px] text-xs bg-zinc-50 dark:bg-zinc-900 resize-none"
                    />
                    <Button 
                        size="sm" 
                        className="self-end" 
                        disabled={submitting || !replyContent.trim()}
                        onClick={() => handlePostComment(comment.id, replyContent)}
                    >
                        Reply
                    </Button>
                </div>
            )}

            {/* Render Replies */}
            {!isReply && replies.length > 0 && (
                <div className="mt-2 space-y-3">
                    {replies.map(reply => (
                        <CommentItem 
                          key={reply.id} 
                          comment={reply} 
                          isReply={true} 
                          replyTo={replyTo}
                          setReplyTo={setReplyTo}
                          replyContent={replyContent}
                          setReplyContent={setReplyContent}
                          handlePostComment={handlePostComment}
                          submitting={submitting}
                        />
                    ))}
                </div>
            )}
        </div>
      </div>
    );
  }

