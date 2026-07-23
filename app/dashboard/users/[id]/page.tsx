"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchUserById,
  fetchUserEmergencyContacts,
  fetchUserPosts,
  fetchUserReported,
  fetchUserReports,
  fetchUserSurvey,
  toggleUserBlockStatus,
} from "@/lib/slices/userSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Phone, ShieldAlert } from "lucide-react";

type Tab = "emergency" | "posts" | "reported" | "reports" | "survey";

type PaginationInfo = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
} | null;

type EmergencyContact = {
  _id: string;
  name?: string | null;
  number?: string | null;
  relation?: string | null;
  createdAt?: string;
};

type PostMedia = {
  url?: string;
  type?: string;
};

type UserPost = {
  _id: string;
  title?: string;
  description?: string;
  type?: string;
  dateTime?: number;
  address?: string;
  frequency?: string;
  occurrence?: number;
  cycle?: number;
  media?: PostMedia[];
  isPinned?: boolean;
  createdAt?: string;
};

type ReportedEntity = Record<string, unknown>;

type ReportItem = {
  _id: string;
  type?: string;
  targetModel?: string;
  reason?: string;
  status?: string;
  action?: string;
  createdAt?: string;
  reported?: ReportedEntity;
  reportedBy?: unknown;
};

type SurveyItem = {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  createdAt?: string;
};

const PAGE_SIZE = 10;

const tabs: { key: Tab; label: string }[] = [
  { key: "emergency", label: "Emergency Contacts" },
  { key: "posts", label: "Posts" },
  { key: "reported", label: "Reported By User" },
  { key: "reports", label: "Reports Against User" },
  { key: "survey", label: "Survey" },
];

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const formatPostDate = (unix?: number) => {
  if (!unix) return "N/A";
  const date = new Date(unix * 1000);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const getModelLabel = (item: ReportItem) => {
  const model = (item.targetModel || item.type || "").toString().toLowerCase();
  if (model.includes("comment")) return "Comment";
  if (model.includes("post")) return "Post";
  if (model.includes("user")) return "User";
  if (model.includes("circle")) return "Circle";
  return "Entity";
};

function PaginationBar({
  pagination,
  onPrev,
  onNext,
}: {
  pagination: PaginationInfo;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!pagination) return null;

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-semibold">
          {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
        </span>{" "}
        of <span className="font-semibold">{pagination.totalItems}</span>
      </p>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          disabled={pagination.currentPage <= 1}
          onClick={onPrev}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" style={{ color: "var(--primary-blue)" }} />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          disabled={pagination.currentPage >= pagination.totalPages}
          onClick={onNext}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" style={{ color: "var(--primary-blue)" }} />
        </Button>
      </div>
    </div>
  );
}

function ReportEntityCard({ item }: { item: ReportItem }) {
  const model = getModelLabel(item);
  const entity = item.reported ?? {};

  const userView =
    model === "User"
      ? {
        title: (entity.name as string) || "Unknown user",
        fields: [
          { label: "Email", value: (entity.email as string) || "N/A" },
          { label: "Phone", value: (entity.phone as string) || "N/A" },
          { label: "Address", value: (entity.address as string) || "N/A" },
          { label: "Bio", value: (entity.bio as string) || "N/A" },
        ],
      }
      : null;

  const postView =
    model === "Post"
      ? {
        title: (entity.title as string) || "Untitled post",
        fields: [
          { label: "Type", value: (entity.type as string) || "N/A" },
          { label: "Description", value: (entity.description as string) || "N/A" },
          { label: "Address", value: (entity.address as string) || "N/A" },
          { label: "Frequency", value: entity.frequency ? String(entity.frequency) : "N/A" },
          {
            label: "Occurrence",
            value: typeof entity.occurrence === "number" ? String(entity.occurrence) : "N/A",
          },
        ],
      }
      : null;

  const commentView =
    model === "Comment"
      ? {
        title: "Comment",
        fields: [
          { label: "Description", value: (entity.description as string) || "N/A" },
          { label: "Likes", value: typeof entity.likes === "number" ? String(entity.likes) : "N/A" },
          {
            label: "Replies",
            value: typeof entity.replies === "number" ? String(entity.replies) : "N/A",
          },
        ],
      }
      : null;

  const circleView =
    model === "Circle"
      ? {
        title: (entity.name as string) || "Circle",
        fields: [{ label: "Invite Code", value: entity.inviteCode ? String(entity.inviteCode) : "N/A" }],
      }
      : null;

  const view = userView || postView || commentView || circleView;

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{view?.title ?? "Reported entity"}</p>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary">{model}</Badge>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-primary">Report Details</p>
          <div className="mt-2 grid gap-1 text-sm">
            <p><span className="font-medium">Reason:</span> {item.reason || "N/A"}</p>
            <p><span className="font-medium">Status:</span> {item.status || item.action || "pending"}</p>
            <p><span className="font-medium">Created:</span> {formatDate(item.createdAt)}</p>
          </div>
        </div>
      </div>
      <hr className="my-3 border-border" />
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-primary">Reported Entity</p>
        <div className="mt-2 grid gap-1 text-sm">
          {(view?.fields ?? [{ label: "Details", value: "N/A" }]).map((field) => (
            <p key={`${field.label}-${field.value}`}>
              <span className="font-medium">{field.label}:</span> {field.value}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();

  const {
    userDetail,
    detailLoading,
    emergencyContacts,
    posts,
    reportedPosts,
    reportsAgainstUser,
    postsPagination,
    reportedPagination,
    reportsPagination,
    sectionLoading,
    surveyData,
    userCheckinfo,
  } = useSelector((state: RootState) => state.users);
  console.log(userCheckinfo);
  const [activeTab, setActiveTab] = useState<Tab>("emergency");
  const [postsPage, setPostsPage] = useState(1);
  const [reportedPage, setReportedPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [blockLoading, setBlockLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchUserById(id));
    dispatch(fetchUserEmergencyContacts(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (!id) return;
    if (activeTab === "posts") {
      dispatch(fetchUserPosts({ id, page: postsPage, limit: PAGE_SIZE }));
    }
    if (activeTab === "reported") {
      dispatch(fetchUserReported({ id, page: reportedPage, limit: PAGE_SIZE }));
    }
    if (activeTab === "reports") {
      dispatch(fetchUserReports({ id, page: reportsPage, limit: PAGE_SIZE }));
    }
    if (activeTab === "survey") {
      dispatch(fetchUserSurvey(id));
    }
  }, [activeTab, id, postsPage, reportedPage, reportsPage, dispatch]);

  const handleToggleBlock = async () => {
    if (!userDetail?._id) return;
    setBlockLoading(true);
    await dispatch(
      toggleUserBlockStatus({
        id: userDetail._id,
        toggle: !userDetail.isDeactivatedByAdmin,
      })
    );
    await dispatch(fetchUserById(userDetail._id));
    setBlockLoading(false);
  };

  const userName = useMemo(
    () => userDetail?.name || userDetail?.email || "User",
    [userDetail?.name, userDetail?.email]
  );

  const tabCounts = {
    emergency: (emergencyContacts as EmergencyContact[])?.length ?? 0,
    posts: (posts as UserPost[])?.length ?? 0,
    reported: (reportedPosts as ReportItem[])?.length ?? 0,
    reports: (reportsAgainstUser as ReportItem[])?.length ?? 0,
    survey:
      (Array.isArray(surveyData?.["new-user"]) ? surveyData["new-user"].length : 0) +
      (Array.isArray(surveyData?.["user"]) ? surveyData["user"].length : 0),
  };

  if (detailLoading && !userDetail) {
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
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition"
          style={{ color: "var(--primary-blue)" }}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Users
        </button>

        <section className="rounded-2xl border p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2">
                <AvatarImage src={userDetail?.profilePicture ?? ""} alt={userName} />
                <AvatarFallback className="text-lg font-semibold text-primary">
                  {userName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold">{userName}</h1>
                <p className="text-sm text-muted-foreground">{userDetail?.email || "N/A"}</p>
                <p className="text-sm text-muted-foreground">{userDetail?.phoneNumber || "N/A"}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/40 text-primary">
                {userCheckinfo?.isActive ? "Active" : "Inactive"}
              </Badge>

              <Button
                onClick={handleToggleBlock}
                disabled={blockLoading || detailLoading}
                variant="outline"
                className="border-primary/40 text-primary"
              >
                {blockLoading
                  ? "Updating..."
                  : userDetail?.isDeactivatedByAdmin
                    ? "Unblock User"
                    : "Block User"}
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 xl:grid-cols-4">
            <InfoRow label="Address" value={userDetail?.homeAddress || userDetail?.address || "N/A"} />
            <InfoRow label="Joined Group" value={userDetail?.joinedCount ? String(userDetail.joinedCount) : "Not Joined"} />
            <InfoRow label="Notified Status" value={userCheckinfo?.notified ? "Yes" : "No"} />
            <InfoRow label="Missed Count" value={userCheckinfo?.missedCount || 0} />

          </div>

          <div className="mt-5 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 xl:grid-cols-4">

            <InfoRow label="Next Check-in Due Date" value={formatDate(userCheckinfo?.nextCheckInDueAt)} />

            <InfoRow label="Joined On" value={formatDate(userDetail?.createdAt)} />
            <InfoRow label="Updated On" value={formatDate(userDetail?.updatedAt)} />
            <InfoRow label="Last Check-In Date" value={formatDate(userCheckinfo?.lastCheckInAt || '')} />


          </div>
          {userDetail?.bio && (
            <p className="mt-4 rounded-lg border p-3 text-sm">
              {userDetail.bio}
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border">
          <div className="grid grid-cols-2 border-b md:grid-cols-5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium transition ${activeTab === tab.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-primary"
                  }`}
                style={
                  activeTab === tab.key
                    ? { borderColor: "var(--primary-blue)", color: "var(--primary-blue)" }
                    : undefined
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === "emergency" && (
              <TabState loading={sectionLoading.emergencyContacts || detailLoading} empty={!tabCounts.emergency}>
                <div className="grid gap-3 md:grid-cols-2">
                  {(emergencyContacts as EmergencyContact[]).map((contact) => (
                    <div key={contact._id} className="rounded-xl border p-4">
                      <div className="mb-2">
                        <h3 className="text-sm font-semibold">{contact.name || "N/A"}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-primary">Relation:</span> {contact.relation || "N/A"}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1 text-sm">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        {contact.number || "N/A"}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">{formatDate(contact.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </TabState>
            )}

            {activeTab === "posts" && (
              <TabState loading={sectionLoading.posts} empty={!tabCounts.posts}>
                <div className="space-y-3">
                  {(posts as UserPost[]).map((post) => (
                    <div key={post._id} className="rounded-xl border p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-semibold">{post.title || "Untitled Post"}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-primary/40 text-primary">
                            {post.type
                              ? `${post.type.charAt(0).toUpperCase()}${post.type.slice(1)}`
                              : "Post"}
                          </Badge>
                          {post.isPinned && (
                            <Badge variant="outline" className="border-primary/40 text-primary">Pinned</Badge>
                          )}
                        </div>
                      </div>
                      <p className="whitespace-pre-line text-sm">
                        {post.description || "No description"}
                      </p>
                      <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                        <p>Date: {formatPostDate(post.dateTime)}</p>
                        <p>Frequency: {post.frequency || "N/A"}</p>
                        <p>Occurrence: {typeof post.occurrence === "number" ? post.occurrence : "N/A"}</p>
                        <p>Media: {post.media?.length || 0}</p>
                      </div>
                      {post.address && <p className="mt-2 text-xs text-muted-foreground">Address: {post.address}</p>}
                    </div>
                  ))}
                </div>
                <PaginationBar
                  pagination={postsPagination as PaginationInfo}
                  onPrev={() => setPostsPage((prev) => Math.max(prev - 1, 1))}
                  onNext={() => setPostsPage((prev) => prev + 1)}
                />
              </TabState>
            )}

            {activeTab === "reported" && (
              <TabState loading={sectionLoading.reported} empty={!tabCounts.reported}>
                <div className="space-y-3">
                  {(reportedPosts as ReportItem[]).map((item) => (
                    <ReportEntityCard key={item._id} item={item} />
                  ))}
                </div>
                <PaginationBar
                  pagination={reportedPagination as PaginationInfo}
                  onPrev={() => setReportedPage((prev) => Math.max(prev - 1, 1))}
                  onNext={() => setReportedPage((prev) => prev + 1)}
                />
              </TabState>
            )}

            {activeTab === "reports" && (
              <TabState loading={sectionLoading.reports} empty={!tabCounts.reports}>
                <div className="space-y-3">
                  {(reportsAgainstUser as ReportItem[]).map((item) => (
                    <ReportEntityCard key={item._id} item={item} />
                  ))}
                </div>
                <PaginationBar
                  pagination={reportsPagination as PaginationInfo}
                  onPrev={() => setReportsPage((prev) => Math.max(prev - 1, 1))}
                  onNext={() => setReportsPage((prev) => prev + 1)}
                />
              </TabState>
            )}

            {activeTab === "survey" && (
              <TabState loading={sectionLoading.survey} empty={!tabCounts.survey}>
                {(() => {
                  const survey1: SurveyItem[] = Array.isArray(surveyData?.["new-user"])
                    ? surveyData["new-user"]
                    : [];
                  const survey2: SurveyItem[] = Array.isArray(surveyData?.["user"])
                    ? surveyData["user"]
                    : [];

                  if (survey1.length === 0 && survey2.length === 0) return null;

                  return (
                    <div className="space-y-8">
                      {survey1.length > 0 && (
                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                            <h2 className="text-xl font-bold" style={{ color: "var(--primary-blue)" }}>
                              Survey 1: New User
                            </h2>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submitted On:</span>
                              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 text-sm">
                                {formatDate(survey1[0]?.createdAt)}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            {survey1.map((item) => (
                              <div key={item._id} className="flex flex-col justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-5 transition hover:shadow-sm">
                                <div>
                                  <h3 className="text-[15px] font-semibold leading-snug text-gray-800">{item.question || "N/A"}</h3>
                                </div>
                                <div className="mt-4 rounded-lg bg-white p-4 shadow-sm border border-primary/10">
                                  <p className="text-[15px] font-medium text-primary" style={{ color: "var(--primary-blue)" }}>
                                    {item.answer || "No answer provided"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {survey2.length > 0 && (
                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                            <h2 className="text-xl font-bold" style={{ color: "var(--primary-blue)" }}>
                              Survey 2: Existing User
                            </h2>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submitted On:</span>
                              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 text-sm">
                                {formatDate(survey2[0]?.createdAt)}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            {survey2.map((item) => (
                              <div key={item._id} className="flex flex-col justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-5 transition hover:shadow-sm">
                                <div>
                                  <h3 className="text-[15px] font-semibold leading-snug text-gray-800">{item.question || "N/A"}</h3>
                                </div>
                                <div className="mt-4 rounded-lg bg-white p-4 shadow-sm border border-primary/10">
                                  <p className="text-[15px] font-medium text-primary" style={{ color: "var(--primary-blue)" }}>
                                    {item.answer || "No answer provided"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </TabState>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-primary" style={{ color: "var(--primary-blue)" }}>
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function TabState({
  loading,
  empty,
  children,
}: {
  loading: boolean;
  empty: boolean;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl border bg-gray-100" />
        ))}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="rounded-xl border py-12 text-center">
        <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-primary" />
        <p className="text-sm font-medium">No data found</p>
        <p className="mt-1 text-xs text-muted-foreground">This tab currently has no records to show.</p>
      </div>
    );
  }

  return <>{children}</>;
}
