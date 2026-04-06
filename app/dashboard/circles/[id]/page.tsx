"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchCircleById,
  fetchCirclePosts,
  fetchCircleMembers,
  updateCircleNameThunk,
  updateCircleInviteThunk,
  toggleCircleAdminThunk,
  removeMemberFromCircleThunk,
} from "@/lib/slices/circleSlice";

import { Edit, RefreshCw } from "lucide-react";
import { NameModal } from "../components/NameModalProps";

type Tab = "members" | "posts";

const TABS: { key: Tab; label: string }[] = [
  { key: "members", label: "Members" },
  { key: "posts", label: "Posts" },
];

export default function IdPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const {
    circleDetail,
    loading,
    posts,
    members,
    adminloading,
    membersLoading,
    postsLoading,
  } = useSelector((state: RootState) => state.circles);

  const [activeTab, setActiveTab] = useState<Tab>("members");
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [editType, setEditType] = useState<"name" | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  // ─── Fetch Circle Data ─────────────────────────────
  const loadCircleData = async () => {
    if (!id) return;
    const circleId = Array.isArray(id) ? id[0] : id;
    dispatch(fetchCircleById(circleId));
    dispatch(fetchCirclePosts(circleId));
    dispatch(fetchCircleMembers(circleId));
  };

  useEffect(() => {
    loadCircleData();
  }, [id, dispatch]);

  // ─── Handle Name Update ───────────────────────────
  const handleNameSubmit = (value: string) => {
    if (!id) return;

    if (editType === "name") {
      const circleId = Array.isArray(id) ? id[0] : id;
      dispatch(updateCircleNameThunk({ id: circleId, name: value }))
        .unwrap()
        .then(() => loadCircleData()); // only refresh circle info
    }

    setNameModalOpen(false);
  };

  // ─── Handle Invite Update ─────────────────────────
  const handleInviteUpdate = async () => {
    if (!id) return;
    try {
      setInviteLoading(true);
      const circleId = Array.isArray(id) ? id[0] : id;
      // Generate a random invite code or let backend generate it
      const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await dispatch(updateCircleInviteThunk({ id: circleId, inviteCode: newInviteCode })).unwrap();
      loadCircleData(); // only refresh circle info
    } catch (err) {
      console.log(err);
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* NAME MODAL */}
      <NameModal
        open={nameModalOpen}
        onOpenChange={(open) => setNameModalOpen(open)}
        onSubmit={handleNameSubmit}
      />

      <div className="mx-auto space-y-5">
        {/* BACK BUTTON */}
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ← Back to Circles
        </button>

        {/* PROFILE CARD */}
        <div className="bg-white border rounded-xl p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-semibold">
                {circleDetail?.name?.[0]?.toUpperCase() || "C"}
              </div>

              <div>
                {/* Name */}
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  {circleDetail?.name || "No Name"}
                  <Edit
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => {
                      setEditType("name");
                      setNameModalOpen(true);
                    }}
                  />
                </h1>

                {/* Invite */}
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  Invite Code: {circleDetail?.inviteCode || "—"}
                  <RefreshCw
                    className={`w-4 h-4 cursor-pointer ${
                      inviteLoading ? "animate-spin opacity-50" : ""
                    }`}
                    onClick={handleInviteUpdate}
                  />
                </p>
              </div>
            </div>
          </div>

          <hr />

          {/* DETAILS */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Created</p>
              <p>
                {circleDetail?.createdAt
                  ? new Date(circleDetail.createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Updated</p>
              <p>
                {circleDetail?.updatedAt
                  ? new Date(circleDetail.updatedAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Users</p>
              <p>{circleDetail?.usersCount ?? 0}</p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="flex border-b">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-sm font-medium cursor-pointer ${
                  activeTab === tab.key
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5 max-h-[600px] overflow-y-auto">
            {activeTab === "members" && (
              <div>
                <div className="space-y-3">
                  
                  
               {members?.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Not Found</p>
                  ) : (
                    members?.map((user: any) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50"
                      >
                        {/* LEFT */}
                        <div
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(`/dashboard/users/${user.user?._id}`)
                          }
                        >
                          <p className="text-sm font-medium">
                            {user.user?.name || "No name"}
                          </p>
                          <p
                            className={`text-xs ${user.isAdmin ? "text-green-600" : "text-gray-400"}`}
                          >
                            {user.isAdmin ? "Admin" : "Member"}
                          </p>
                        </div>

                        {/* RIGHT */}
                        <div className="flex items-center gap-3">
                          <label className="flex items-center cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={user?.isAdmin}
                                disabled={adminloading}
                                onChange={async () => {
                                  try {
                                    const circleId = Array.isArray(id) ? id[0] : id;
                                    const userId = user?.user?._id;
                                    if (!circleId || !userId) return;
                                    await dispatch(
                                      toggleCircleAdminThunk({
                                        id: circleId,
                                        userId: userId,
                                        toggle: !user?.isAdmin,
                                      }),
                                    ).unwrap();

                                    dispatch(fetchCircleMembers(circleId));
                                  } catch (err) {
                                    console.error("Toggle failed:", err);
                                  }
                                }}
                              />

                              <div
                                className={`w-10 h-4 rounded-full shadow-inner ${
                                  user?.isAdmin ? "bg-green-300" : "bg-gray-300"
                                }`}
                              ></div>

                              <div
                                className={`dot absolute w-6 h-6 rounded-full shadow -left-1 -top-1 transition-all ${
                                  user?.isAdmin
                                    ? "translate-x-full bg-green-600"
                                    : "bg-gray-400"
                                }`}
                              ></div>
                            </div>
                          </label>

                          <button
                            onClick={() => {
                              const circleId = Array.isArray(id) ? id[0] : id;
                              const userId = user.user?._id;
                              if (!circleId || !userId) return;
                              dispatch(
                                removeMemberFromCircleThunk({
                                  id: circleId,
                                  userId: userId,
                                  toggle: true,
                                }),
                              )
                                .unwrap()
                                .then(() => {
                                  dispatch(fetchCircleMembers(circleId));
                                });
                            }}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
         {activeTab === "posts" && (
  <div>
    {postsLoading ? (
      <p className="text-center py-4 text-gray-500">Loading...</p>
    ) : posts?.length === 0 ? (
      <p className="text-center py-4 text-gray-500">No Posts Found</p>
    ) : (
      <div className="space-y-3">
        {posts?.map((post: any) => (
          <div
            key={post._id}
            className="border rounded-xl p-4 space-y-3"
          >
            {/* Title */}
            <p className="text-sm font-medium">
              {post.title || "Untitled"}
            </p>

            {/* Description */}
            {post.description && (
              <p className="text-xs text-gray-600">
                {post.description}
              </p>
            )}

            {/* Media */}
            {post.media?.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {post.media.map((m: any) =>
                  m.type === "image" ? (
                    <img
                      key={m._id}
                      src={m.url}
                      alt="media"
                      className="rounded-lg w-full object-cover aspect-video"
                    />
                  ) : null
                )}
              </div>
            )}

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>
                <p>Date</p>
                <p className="font-medium">  {post.updatedAt ? new Date(post.updatedAt).toLocaleString() : "—"}</p>
              </div>

              <div>
                <p>Cycles</p>
                <p className="font-medium">{post.cycles ?? 0}</p>
              </div>
              <div>
                <p>Occurrence</p>
                <p className="font-medium">{post.occurrence || "—"}</p>
              </div>
              <div>
                <p>Frequency</p>
                <p className="font-medium capitalize">
                  {post.frequency || "—"}
                </p>
              </div>
              
              
              <div>
                <p>Pinned</p>
                <p className="font-medium">
                  {post.isPinned ? "Yes" : "No"}
                </p>
              </div>
               <div>
                <p>Type</p>
                <p className="font-medium">
                  {post.type || "—"}
                </p>
              </div>
              <div className="col-span-2">
                <p>Address</p>
                <p className="font-medium">{post.address || "—"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB WRAPPER ─────────────────────────────────────────────
