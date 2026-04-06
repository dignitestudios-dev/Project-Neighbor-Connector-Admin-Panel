"use client";

import React, { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Clock,
  CalendarDays,
  RefreshCw,
  Hash,
  Users,
  MessageCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchPostById, fetchDeletePostById, fetchGetCommentById } from "@/lib/slices/postSlice";
import { useParams } from "next/navigation";

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const formatDateOnly = (timestamp?: number) => {
  if (!timestamp) return "-";
  return new Date(timestamp * 1000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTimeOnly = (timestamp?: number) => {
  if (!timestamp) return "-";
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MetaItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
}) => (
  <div className="flex items-start gap-3 rounded-xl bg-muted/50 px-4 py-3">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value || "-"}</p>
    </div>
  </div>
);

const PostDetailCard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const { id } = params;
  const { postDetail, comments } = useSelector((state: RootState) => state.posts);

  console.log("postDetail", postDetail);
  useEffect(() => {
    if (id) {
      const postId = Array.isArray(id) ? id[0] : id;
      if (postId) {
        dispatch(fetchPostById(postId));
      }
    }
  }, [id, dispatch]);

// Fetch comments only when postDetail and circleId exist
useEffect(() => {
  if (postDetail?.circle && Array.isArray(postDetail.circle) && postDetail.circle.length > 0) {
    const circleId = postDetail.circle[0]?._id;
    const postId = Array.isArray(id) ? id[0] : id;
    if (circleId && postId) {
      dispatch(fetchGetCommentById({ id: postId, circleId }));
    }
}
}, [postDetail, id, dispatch])


  // ✅ Delete handler
  const handleDelete = async () => {
    if (!id) return;
    const postId = Array.isArray(id) ? id[0] : id;
    if (!postId) return;

    try {
      await dispatch(fetchDeletePostById(postId)).unwrap();
    
      window.history.back();
    } catch (error: any) {
      alert(error || "Delete failed");
    }
  };

  if (!postDetail) {
    return <p className="p-5">Loading...</p>;
  }

  return (
    <div className="p-6">
      {/* Back + Delete buttons */}
      <div className="flex justify-between items-center py-5">
        <button
          onClick={() => window.history.back()}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
        >
          ← Back to Post 
        </button>

        <button
          onClick={handleDelete}
          className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md"
        >
          Delete Post
        </button>
      </div>

      <Card className="w-full overflow-hidden rounded-2xl shadow-sm">
        {/* Hero Image */}
        {postDetail?.media?.length > 0 && (
          <div className="grid grid-cols-4 gap-3 px-4">
            {postDetail.media.map((item: any) => (
              <div key={item._id} className="relative h-40 w-full">
                <img
                  src={item.url}
                  alt="Post"
                  className="h-full w-full object-cover rounded-md"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-md" />
                <div className="absolute left-2 top-2">
                  <Badge className="bg-blue-600 text-white text-xs">{postDetail.type}</Badge>
                </div>
                {postDetail?.isPinned && (
                  <Badge variant="secondary" className="absolute right-2 top-2 text-xs">
                    📌
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        <CardContent className="space-y-5 p-5">
          {/* Title */}
          <div>
            <h2 className="text-base font-semibold">{postDetail?.title || "-"}</h2>
            <p className="text-sm text-muted-foreground">{postDetail?.description || "-"}</p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-2.5">
            <MetaItem
  label="Date"
  icon={CalendarDays}
  value={formatDateOnly(postDetail?.dateTime)}
/>

<MetaItem
  label="Time"
  icon={Clock}
  value={formatTimeOnly(postDetail?.dateTime)}
/>
            <MetaItem label="Frequency" icon={RefreshCw} value={postDetail?.frequency} />
            <MetaItem
              label="Occurrence"
              icon={Hash}
              value={postDetail?.occurrence ? `${postDetail.occurrence} times` : "-"}
            />
          </div>

          <Separator />

          {/* User */}
          {postDetail?.user && (
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {postDetail.user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="font-semibold leading-none">{postDetail.user.name}</p>
              </div>
            </div>
          )}

          {/* Circle */}
          {postDetail?.circle?.length > 0 && (
            <>
              <Separator />
              {postDetail.circle.map((c: any) => (
                <div key={c._id} className="flex gap-3">
                  <Users className="h-4 w-4" />
                  <div>
                    <p>{c.name}</p>
                    <p className="text-xs">Invite: {c.inviteCode}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
{/* Comments Section */}
{comments?.length > 0 && (
  <>
    <Separator className="my-4" />
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <MessageCircle className="h-4 w-4" /> Comments
      </h3>

      {/* Comment List */}
      <div className="space-y-2">
        {comments.map((c: any) => (
          <div
            key={c._id}
            className="flex gap-2 items-start bg-muted/20 rounded-md p-2"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback>
                {c.user?.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{c.user?.name || "User"}</p>
              <p className="text-sm">{c.text}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(c.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
)}
        <CardFooter className="flex justify-between text-xs text-muted-foreground">
          <span>Created: {formatDate(postDetail?.createdAt)}</span>
          <span>Updated: {formatDate(postDetail?.updatedAt)}</span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PostDetailCard;