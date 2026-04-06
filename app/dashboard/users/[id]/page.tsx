"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {

  fetchUserById,
  fetchUserEmergencyContacts,
  fetchUserPosts,
  fetchUserReported,
  fetchUserReports,
  toggleUserBlockStatus,

} from "@/lib/slices/userSlice";
import { AppDispatch, RootState } from "@/lib/store";

// ─── Tab Type ─────────────────────────────────────────────────────────────────

type Tab = "emergency" | "posts" | "reported" | "reports";

const TABS: { key: Tab; label: string }[] = [
  { key: "emergency", label: "Emergency Contacts" },
  { key: "posts", label: "Posts" },
  { key: "reported", label: "Reported" },
  { key: "reports", label: "Reports" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IdPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    userDetail,
    userCheckinfo,
    loading,
    posts,
    emergencyContacts,
    reportedPosts,
    reportsAgainstUser,

  } = useSelector((state: RootState) => state.users);

  const params = useParams();
  const { id } = params;

  const [activeTab, setActiveTab] = useState<Tab>("emergency");
  const [showActionMenu, setShowActionMenu] = useState(false);
const handleToggleBlock = async () => {
  if (!userDetail?._id) return;

  await dispatch(
    toggleUserBlockStatus({
      id: userDetail._id,
      toggle: !userDetail.isDeactivatedByAdmin,
    })
  );

  // 👇 dubara fresh data load karo
  dispatch(fetchUserById(userDetail._id));
};
  // Fetch user detail
  useEffect(() => {
    if (id && typeof id === "string") {
      dispatch(fetchUserById(id));
      dispatch(fetchUserEmergencyContacts(id));
      dispatch(fetchUserPosts(id));
      dispatch(fetchUserReported(id));
      dispatch(fetchUserReports(id));
    
    }
  }, [id, dispatch]);
  

  console.log(userDetail, "userDetail");
  console.log(userCheckinfo, "userCheckinfo");
  return (
    <div className="min-h-screen p-6 ">
      <div className=" mx-auto space-y-5">

        {/* Back */}
        <button
          onClick={() => window.history.back()}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
        >
          ← Back to Users
        </button>

      {/* Profile Card */}
<div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <div className="relative shrink-0">
        {userDetail?.profilePicture ? (
          <img
            src={userDetail.profilePicture}
            alt={userDetail?.name ?? "User"}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-semibold">
            {userDetail?.name?.[0]?.toUpperCase() ?? userDetail?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        {/* Online/Active indicator */}
        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white bg-green-400" />
      </div>

      {/* Basic Info */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          {userDetail?.name ?? <span className="italic text-gray-400">No name</span>}
        </h1>
        <p className="text-sm text-gray-500">{userDetail?.email}</p>
        {userDetail?.phone && (
          <p className="text-sm text-gray-400">{userDetail.phone}</p>
        )}
      </div>
    </div>

    {/* Status badges */}
    <div className="flex items-center gap-2">
  <button
    onClick={handleToggleBlock}
    disabled={loading}
    className={`px-4 py-1.5 text-xs font-medium rounded-md transition 
    ${
      userDetail?.isDeactivatedByAdmin
        ? "bg-green-100 text-green-700 hover:bg-green-200"
        : "bg-red-100 text-red-600 hover:bg-red-200"
    }
    ${loading ? "opacity-50 cursor-not-allowed" : ""}
    `}
  >
    {loading
      ? "Processing..."
      : userDetail?.isDeactivatedByAdmin
      ? "Unblock User"
      : "Block User"}
  </button>
</div>
  </div>

  {/* Divider */}
  <hr className="border-gray-100" />

  {/* Detail Grid */}
  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
    {userDetail?.address && (
      <div className="col-span-2">
        <p className="text-xs text-gray-400 mb-0.5">Address</p>
        <p className="text-gray-700">{userDetail.address}</p>
      </div>
    )}
    <div>
      <p className="text-xs text-gray-400 mb-0.5">Joined</p>
      <p className="text-gray-700">
        {userDetail?.createdAt
          ? new Date(userDetail.createdAt).toLocaleDateString("en-US", {
              day: "numeric", month: "short", year: "numeric",
            })
          : "—"}
      </p>
    </div>
    <div>
      <p className="text-xs text-gray-400 mb-0.5">Last Updated</p>
      <p className="text-gray-700">
        {userDetail?.updatedAt
          ? new Date(userDetail.updatedAt).toLocaleDateString("en-US", {
              day: "numeric", month: "short", year: "numeric",
            })
          : "—"}
      </p>
    </div>
    {userDetail?.bio && (
      <div className="col-span-2">
        <p className="text-xs text-gray-400 mb-0.5">Bio</p>
        <p className="text-gray-700">{userDetail.bio}</p>
      </div>
    )}
  </div>

  {/* Check-In Info */}
 
  

</div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 text-sm font-medium py-3 px-4 transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-5 overflow-y-auto max-h-[300px]">

            {/* 1 — Emergency Contacts */}
            {activeTab === "emergency" && (
              <TabSection loading={loading} isEmpty={!emergencyContacts?.length}>
                <div className="space-y-3">
                  {emergencyContacts?.map((contact: any) => (
                    <div
                      key={contact._id}
                      className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{contact.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{contact.relation ?? "—"}</p>
                      </div>
                      <p className="text-sm text-gray-600">{contact.number ?? "—"}</p>
                    </div>
                  ))}
                </div>
              </TabSection>
            )}

            {/* 2 — Posts */}
            {activeTab === "posts" && (
              <TabSection loading={loading} isEmpty={!posts?.length}>
                <div className="space-y-3">
                  {posts?.map((post: any) => (
                    <div
                      key={post._id}
                      className="border border-gray-100 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{post.title ?? "Untitled"}</p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{post.description ?? "—"}</p>
                        </div>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                            post.type === "event"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {post.type ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-400">📅 {post.date ?? "—"}</p>
                        <p className="text-xs text-gray-400">🕐 {post.time ?? "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabSection>
            )}

            {/* 3 — Reported */}
            {activeTab === "reported" && (
              <TabSection loading={loading} isEmpty={!reportedPosts?.length}>
                <div className="space-y-3">
                  {reportedPosts?.map((item: any) => (
                    <div
                      key={item._id}
                      className="border border-gray-100 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.reason ?? "No reason"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.description ?? "—"}</p>
                        </div>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 shrink-0">
                          Reported
                        </span>
                      </div>
                      {item.createdAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </TabSection>
            )}

            {/* 4 — Reports */}
            {activeTab === "reports" && (
              <TabSection loading={loading} isEmpty={!reportsAgainstUser?.length}>
                <div className="space-y-3">
                  {reportsAgainstUser?.map((item: any) => (
                    <div
                      key={item._id}
                      className="border border-gray-100 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.reason ?? "No reason"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.description ?? "—"}</p>
                        </div>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 shrink-0">
                          Report
                        </span>
                      </div>
                      {item.createdAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </TabSection>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Tab Section Wrapper ──────────────────────────────────────────────────────

function TabSection({
  loading,
  isEmpty,
  children,
}: {
  loading: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="py-12 text-center text-gray-400">
        <p className="text-3xl mb-2">📭</p>
        <p className="text-sm">No data available</p>
      </div>
    );
  }

  return <>{children}</>;
}