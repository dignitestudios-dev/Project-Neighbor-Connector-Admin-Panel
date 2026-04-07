"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, Loader2, MessageCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchDeletePostById, fetchGetCommentById, fetchPostById } from "@/lib/slices/postSlice";

type PostMedia = { _id?: string; url?: string; type?: "image" | "video" };
type PostUser = { _id?: string; name?: string; email?: string; phone?: string };
type PostCircle = { _id?: string; name?: string };
type PostComment = { _id?: string; text?: string; createdAt?: string; user?: { name?: string } };

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
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

export default function PostDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { postDetail, comments } = useSelector((state: RootState) => state.posts);
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
              className="border-primary/30 text-[var(--primary-blue)] hover:text-[var(--primary-blue)] hover:bg-[color:var(--primary-blue)]/5"
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

        {!!postComments.length && (
          <section className="rounded-2xl border p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
              <MessageCircle className="h-4 w-4" style={{ color: "var(--primary-blue)" }} />
              Comments
            </h2>
            <div className="space-y-3">
              {postComments.map((comment) => (
                <div key={comment._id} className="rounded-xl border p-3">
                  <p className="text-sm font-medium">{comment.user?.name || "User"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{comment.text || "No comment text"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDateTimeUs(comment.createdAt)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
