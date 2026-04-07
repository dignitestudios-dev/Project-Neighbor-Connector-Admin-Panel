"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Edit, Loader2, Power, RefreshCw } from "lucide-react";
import { AppDispatch, RootState } from "@/lib/store";
import {
  clearCircleDetail,
  fetchCircleById,
  fetchCircleMembers,
  fetchCirclePosts,
  removeMemberFromCircleThunk,
  toggleCircleAdminThunk,
  updateCircleInviteThunk,
  updateCircleNameThunk,
} from "@/lib/slices/circleSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NameModal } from "../components/NameModalProps";
import { ensureSocketConnection } from "@/lib/socket";
import { toast } from "sonner";

type Tab = "members" | "posts";

type Member = {
  _id: string;
  isAdmin?: boolean;
  createdAt?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    profilePicture?: string;
  };
};

type Post = {
  _id: string;
  title?: string;
  description?: string;
  type?: string;
  createdAt?: string;
  dateTime?: number;
  frequency?: string;
  occurrence?: number;
  isPinned?: boolean;
  media?: Array<{ _id?: string; url?: string; type?: string }>;
  address?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    profilePicture?: string;
  };
};

const PAGE_SIZE = 10;

const TABS: { key: Tab; label: string }[] = [
  { key: "members", label: "Members" },
  { key: "posts", label: "Posts" },
];

const formatUsDate = (value?: string) => {
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

const formatUnixToUsDate = (value?: number) => {
  if (!value) return "N/A";
  const date = new Date(value * 1000);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl border bg-gray-100" />
      ))}
    </div>
  );
}

function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPrev,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startItem}-{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span>
      </p>
      <div className="flex items-center space-x-3">
        <p className="text-sm text-muted-foreground">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onPrev} disabled={currentPage <= 1} aria-label="Previous page">
            <ChevronLeft className="size-4" style={{ color: "var(--primary-blue)" }} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" style={{ color: "var(--primary-blue)" }} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CircleDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const {
    circleDetail,
    detailLoading,
    members,
    posts,
    membersLoading,
    postsLoading,
    membersPagination,
    postsPagination,
    memberActionLoading,
  } = useSelector((state: RootState) => state.circles);

  const [activeTab, setActiveTab] = useState<Tab>("members");
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [membersPage, setMembersPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const [activeMemberActionKey, setActiveMemberActionKey] = useState<string | null>(null);
  const [disableToggleLoading, setDisableToggleLoading] = useState(false);
  const [isCircleDisabled, setIsCircleDisabled] = useState(false);

  useEffect(() => {
    setIsCircleDisabled(Boolean(circleDetail?.isDeactivatedByAdmin));
  }, [circleDetail?.isDeactivatedByAdmin]);

  useEffect(() => {
    ensureSocketConnection();
  }, []);

  useEffect(() => {
    if (!id) return;
    dispatch(clearCircleDetail());
    dispatch(fetchCircleById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!id) return;
    if (activeTab === "members") {
      dispatch(fetchCircleMembers({ id, page: membersPage, limit: PAGE_SIZE }));
    }
    if (activeTab === "posts") {
      dispatch(fetchCirclePosts({ id, page: postsPage, limit: PAGE_SIZE }));
    }
  }, [dispatch, id, activeTab, membersPage, postsPage]);

  const handleNameSubmit = async (value: string) => {
    if (!id) return;
    await dispatch(updateCircleNameThunk({ id, name: value })).unwrap();
    await dispatch(fetchCircleById(id));
    setNameModalOpen(false);
  };

  const handleInviteUpdate = async () => {
    if (!id) return;
    try {
      setInviteLoading(true);
      const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await dispatch(updateCircleInviteThunk({ id, inviteCode: newInviteCode })).unwrap();
      await dispatch(fetchCircleById(id));
    } finally {
      setInviteLoading(false);
    }
  };

  const handleAdminToggleChat = () => {
    const chatRoomId = circleDetail?.chatRoom;
    if (!chatRoomId) {
      toast.error("Chat room id is missing.");
      return;
    }
    const socket = ensureSocketConnection();
    if (!socket) {
      toast.error("Socket is not connected.");
      return;
    }

    try {
      setDisableToggleLoading(true);
      const nextToggle = !isCircleDisabled;
      socket.emit("adminToggleChat", { id: chatRoomId, toggle: nextToggle });
      setIsCircleDisabled(nextToggle);
      toast.success("Toggle event emitted.");
    } finally {
      setDisableToggleLoading(false);
    }
  };

  const membersData = useMemo(() => (members ?? []) as Member[], [members]);
  const postsData = useMemo(() => (posts ?? []) as Post[], [posts]);
  const isSameCircle = circleDetail?._id === id;

  if (detailLoading || !circleDetail || !isSameCircle) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-100" />
          <div className="h-48 animate-pulse rounded-2xl border bg-gray-100" />
          <div className="h-72 animate-pulse rounded-2xl border bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <NameModal
        open={nameModalOpen}
        onOpenChange={setNameModalOpen}
        onSubmit={handleNameSubmit}
      />

      <div className="mx-auto max-w-7xl space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm font-medium transition"
          style={{ color: "var(--primary-blue)" }}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Circles
        </button>

        <section className="rounded-2xl border p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 text-xl font-semibold text-primary">
                {circleDetail?.name?.[0]?.toUpperCase() || "C"}
              </div>
              <div>
                <h1 className="inline-flex items-center gap-2 text-xl font-semibold">
                  {circleDetail?.name || "No Name"}
                  <button onClick={() => setNameModalOpen(true)} className="cursor-pointer">
                    <Edit className="h-4 w-4 text-primary" />
                  </button>
                </h1>
                <br />
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  Invite Code: {circleDetail?.inviteCode || "N/A"}
                  <button onClick={handleInviteUpdate} disabled={inviteLoading} className="cursor-pointer">
                    <RefreshCw className={`h-4 w-4 text-primary ${inviteLoading ? "animate-spin" : ""}`} />
                  </button>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/40 text-primary">
                {isCircleDisabled ? "Disabled" : "Active"}
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={handleAdminToggleChat}
                disabled={disableToggleLoading}
                aria-label={isCircleDisabled ? "Enable circle" : "Disable circle"}
                className="border-primary/30"
              >
                {disableToggleLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Power className="size-4" style={{ color: "var(--primary-blue)" }} />
                )}
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-primary">Created</p>
              <p className="mt-1 text-sm font-medium">{formatUsDate(circleDetail?.createdAt)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-primary">Invite Code</p>
              <p className="mt-1 text-sm font-medium">{circleDetail?.inviteCode || "N/A"}</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border">
          <div className="grid grid-cols-2 border-b">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.key ? "border-b-2 text-primary" : "text-muted-foreground hover:text-primary"
                }`}
                style={activeTab === tab.key ? { borderColor: "var(--primary-blue)", color: "var(--primary-blue)" } : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === "members" && (
              <>
                {membersLoading ? (
                  <SkeletonList rows={3} />
                ) : membersData.length ? (
                  <div className="space-y-3">
                    {membersData.map((member) => {
                      const userId = member.user?._id || "";
                      const rowLoading = Boolean(memberActionLoading[userId]);
                      const adminActionKey = `${userId}-admin`;
                      const removeActionKey = `${userId}-remove`;
                      const adminButtonLoading = activeMemberActionKey === adminActionKey;
                      const removeButtonLoading = activeMemberActionKey === removeActionKey;
                      return (
                        <div key={member._id} className="rounded-xl border p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="cursor-pointer" onClick={() => userId && router.push(`/dashboard/users/${userId}`)}>
                              <p className="text-sm font-semibold">{member.user?.name || "No name"}</p>
                              <p className="text-xs text-muted-foreground">{member.user?.email || "No email"}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{member.user?.phone || "No phone"}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-primary/40 text-primary">
                                {member.isAdmin ? "Admin" : "Member"}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={rowLoading}
                                className="min-w-28 border-primary/30 text-primary hover:text-primary hover:bg-primary/5"
                                onClick={async () => {
                                  if (!id || !userId) return;
                                  try {
                                    setActiveMemberActionKey(adminActionKey);
                                    await dispatch(
                                      toggleCircleAdminThunk({
                                        id,
                                        userId,
                                        toggle: !member.isAdmin,
                                      })
                                    ).unwrap();
                                    await dispatch(fetchCircleMembers({ id, page: membersPage, limit: PAGE_SIZE }));
                                  } finally {
                                    setActiveMemberActionKey(null);
                                  }
                                }}
                              >
                                {adminButtonLoading ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : member.isAdmin ? (
                                  "Remove Admin"
                                ) : (
                                  "Make Admin"
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={rowLoading}
                                className="min-w-20 border-primary/30 text-[var(--primary-blue)] hover:text-[var(--primary-blue)] hover:bg-[color:var(--primary-blue)]/5"
                                onClick={async () => {
                                  if (!id || !userId) return;
                                  try {
                                    setActiveMemberActionKey(removeActionKey);
                                    await dispatch(
                                      removeMemberFromCircleThunk({
                                        id,
                                        userId,
                                        toggle: true,
                                      })
                                    ).unwrap();
                                    await dispatch(fetchCircleMembers({ id, page: membersPage, limit: PAGE_SIZE }));
                                  } finally {
                                    setActiveMemberActionKey(null);
                                  }
                                }}
                              >
                                {removeButtonLoading ? <Loader2 className="size-4 animate-spin" /> : "Remove"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-6 text-center text-muted-foreground">No members found.</p>
                )}

                {membersPagination && (
                  <PaginationBar
                    currentPage={membersPagination.currentPage}
                    totalPages={membersPagination.totalPages}
                    totalItems={membersPagination.totalItems}
                    itemsPerPage={membersPagination.itemsPerPage}
                    onPrev={() => setMembersPage((p) => Math.max(p - 1, 1))}
                    onNext={() => setMembersPage((p) => p + 1)}
                  />
                )}
              </>
            )}

            {activeTab === "posts" && (
              <>
                {postsLoading ? (
                  <SkeletonList rows={3} />
                ) : postsData.length ? (
                  <div className="space-y-3">
                    {postsData.map((post) => (
                      <div key={post._id} className="rounded-xl border p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold text-primary">
                              {post.user?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold leading-none">{post.user?.name || "Unknown User"}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{post.user?.email || "No email"}</p>
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>{post.user?.phone || "No phone"}</p>
                            <p>{formatUsDate(post.createdAt)}</p>
                          </div>
                        </div>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-base font-semibold">{post.title || "Untitled Post"}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-primary/40 text-primary">
                              {post.type ? `${post.type.charAt(0).toUpperCase()}${post.type.slice(1)}` : "Post"}
                            </Badge>
                            {post.isPinned && (
                              <Badge variant="outline" className="border-primary/40 text-primary">
                                Pinned
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="line-clamp-4 whitespace-pre-line text-sm">{post.description || "No description"}</p>
                        <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                          <p>Date: {formatUnixToUsDate(post.dateTime)}</p>
                          <p>Frequency: {post.frequency || "N/A"}</p>
                          <p>Occurrence: {typeof post.occurrence === "number" ? post.occurrence : "N/A"}</p>
                          <p>Media: {post.media?.length || 0}</p>
                        </div>
                        {post.address && <p className="mt-2 text-xs text-muted-foreground">Address: {post.address}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-muted-foreground">No posts found.</p>
                )}

                {postsPagination && (
                  <PaginationBar
                    currentPage={postsPagination.currentPage}
                    totalPages={postsPagination.totalPages}
                    totalItems={postsPagination.totalItems}
                    itemsPerPage={postsPagination.itemsPerPage}
                    onPrev={() => setPostsPage((p) => Math.max(p - 1, 1))}
                    onNext={() => setPostsPage((p) => p + 1)}
                  />
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
