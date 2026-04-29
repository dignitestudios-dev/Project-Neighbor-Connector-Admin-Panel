"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, Loader2, MessageCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchDeletePostById,
  fetchGetCommentById,
  fetchGetCommentReplies,
  fetchPostById,
} from "@/lib/slices/postSlice";

type PostMedia = { _id?: string; url?: string; type?: "image" | "video" };
type PostUser = { _id?: string; name?: string; email?: string; phone?: string };
type PostCircle = { _id?: string; name?: string };

type CommentUser = {
  _id?: string;
  name?: string;
  email?: string;
  profilePicture?: string;
};

type PostComment = {
  _id?: string;
  description?: string;
  createdAt?: string;
  user?: CommentUser;
  replies?: number;
};

type PostDetailShape = {
  _id: string;
  title?: string;
  description?: string;
  type?: string;
  frequency?: string;
  occurrence?: number;
  isPinned?: boolean;
  createdAt?: string;
  media?: PostMedia[];
  user?: PostUser;
  circle?: PostCircle[];
};

const formatDateTimeUs = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const formatType = (type?: string) => (type ? `${type.charAt(0).toUpperCase()}${type.slice(1)}` : "N/A");

const initials = (name?: string) =>
  name
    ? name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

function DetailSkeleton() {
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-100" />
        <div className="h-40 animate-pulse rounded-2xl border bg-gray-100" />
        <div className="h-56 animate-pulse rounded-2xl border bg-gray-100" />
      </div>
    </div>
  );
}

function CommentsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border p-4 space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-3.5 w-4/5 ml-12" />
          <Skeleton className="h-3 w-20 ml-12" />
        </div>
      ))}
    </div>
  );
}

function ReplyItem({ reply }: { reply: PostComment }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/40 border p-3">
      <Avatar className="h-7 w-7 shrink-0">
        {reply.user?.profilePicture && (
          <AvatarImage src={reply.user.profilePicture} alt={reply.user.name} />
        )}
        <AvatarFallback className="text-[10px]">{initials(reply.user?.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-sm font-medium leading-tight">{reply.user?.name || "User"}</p>
        <p className="text-xs text-muted-foreground">{reply.user?.email}</p>
        <p className="text-sm text-foreground mt-1">{reply.description || "No text"}</p>
        <p className="text-xs text-muted-foreground">{formatDateTimeUs(reply.createdAt)}</p>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  onLoadReplies,
  replies,
  repliesLoading,
}: {
  comment: PostComment;
  onLoadReplies: (id: string) => void;
  replies?: PostComment[];
  repliesLoading?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasReplies = (comment.replies ?? 0) > 0;

  const handleRepliesClick = () => {
    if (!expanded && !replies) {
      onLoadReplies(comment._id!);
    }
    setExpanded((prev) => !prev);
  };

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          {comment.user?.profilePicture && (
            <AvatarImage src={comment.user.profilePicture} alt={comment.user.name} />
          )}
          <AvatarFallback className="text-xs">{initials(comment.user?.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-semibold leading-tight">{comment.user?.name || "User"}</p>
          <p className="text-xs text-muted-foreground">{comment.user?.email}</p>
        </div>
        <p className="text-xs text-muted-foreground shrink-0">{formatDateTimeUs(comment.createdAt)}</p>
      </div>

      <p className="text-sm text-foreground">{comment.description || "No comment text"}</p>

      {hasReplies && (
        <button
          onClick={handleRepliesClick}
          className="text-xs font-medium underline underline-offset-2 transition-opacity hover:opacity-70"
          style={{ color: "var(--primary-blue)" }}
        >
          {expanded ? "Hide" : `View`} {comment.replies} {comment.replies === 1 ? "reply" : "replies"}
        </button>
      )}

      {expanded && (
        <div className="ml-3 border-l-2 pl-4 space-y-2" style={{ borderColor: "var(--primary-blue)" }}>
          {repliesLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            replies?.map((reply) => <ReplyItem key={reply._id} reply={reply} />)
          )}
        </div>
      )}
    </div>
  );
}

export default function PostDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { postDetail, comments, commentsLoading, repliesMap, repliesLoadingMap } = useSelector(
    (state: RootState) => state.posts
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchPostById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!postDetail || !id) return;
    const circleId = postDetail.circle?.[0]?._id;
    if (circleId) {
      dispatch(fetchGetCommentById({ id, circleId }));
    }
  }, [dispatch, id, postDetail]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleteLoading(true);
      await dispatch(fetchDeletePostById(id)).unwrap();
      router.push("/dashboard/post");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLoadReplies = (commentId: string) => {
    dispatch(fetchGetCommentReplies(commentId));
  };

  const detail = useMemo(() => postDetail as PostDetailShape | null, [postDetail]);
  const postComments = useMemo(() => (comments ?? []) as PostComment[], [comments]);

  if (!detail) {
    return <DetailSkeleton />;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm font-medium transition"
          style={{ color: "var(--primary-blue)" }}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Posts
        </button>

        <section className="rounded-2xl border p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold">{detail.title || "Untitled Post"}</h1>
                <Badge variant="outline" className="border-primary/40 text-primary">
                  {formatType(detail.type)}
                </Badge>
                {detail.isPinned && (
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Pinned
                  </Badge>
                )}
              </div>
              <p className="max-w-3xl whitespace-pre-line text-sm text-muted-foreground">
                {detail.description || "No description"}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              disabled={deleteLoading}
              onClick={handleDelete}
              aria-label="Delete post"
              className="border-primary/30 text-primary-blue hover:text-primary-blue hover:bg-(--primary-blue)/5"
            >
              {deleteLoading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            </Button>
          </div>

          <div className="mt-5 grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-primary">Created</p>
              <p className="mt-1 text-sm font-medium">{formatDateTimeUs(detail.createdAt)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-primary">Frequency</p>
              <p className="mt-1 text-sm font-medium">{detail.frequency || "N/A"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-primary">Occurrence</p>
              <p className="mt-1 text-sm font-medium">{typeof detail.occurrence === "number" ? detail.occurrence : "N/A"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-primary">Media</p>
              <p className="mt-1 text-sm font-medium">{detail.media?.length || 0}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Posted By</h2>
          <div className="mt-3 flex items-start gap-3 rounded-xl border p-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initials(detail.user?.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{detail.user?.name || "Unknown User"}</p>
              <p className="text-muted-foreground">{detail.user?.email || "No email"}</p>
              <p className="text-muted-foreground">{detail.user?.phone || "No phone"}</p>
            </div>
          </div>

          {!!detail.circle?.length && (
            <>
              <Separator className="my-4" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Circles</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {detail.circle.map((circle) => (
                  <Badge key={circle._id || circle.name} variant="outline" className="border-primary/40 text-primary">
                    {circle.name || "Unknown Circle"}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="rounded-2xl border p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
            <MessageCircle className="h-4 w-4" style={{ color: "var(--primary-blue)" }} />
            Comments
            {!commentsLoading && postComments.length > 0 && (
              <span
                className="ml-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                style={{ background: "var(--primary-blue)" }}
              >
                {postComments.length}
              </span>
            )}
          </h2>

          {commentsLoading ? (
            <CommentsSkeleton />
          ) : postComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            <div className="space-y-3">
              {postComments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  onLoadReplies={handleLoadReplies}
                  replies={comment._id ? repliesMap[comment._id] : undefined}
                  repliesLoading={comment._id ? repliesLoadingMap[comment._id] : false}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

