"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchPosts,
  fetchPostById,
} from "@/lib/slices/postSlice";

import { RootState, AppDispatch } from "@/lib/store";
import { PostsTable } from "./components/data-table";
import { useRouter } from "next/navigation";



export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    posts,
    pagination,
    loading,
  } = useSelector((state: RootState) => state.posts);
  console.log("posts", posts);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // const [accountStatus, setAccountStatus] = useState<"all" | "active" | "deactivated">("all");

  // debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // users API
  useEffect(() => {
    dispatch(
      fetchPosts({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
        // accountStatus: accountStatus === "all" ? undefined : accountStatus,
      })
    );
  }, [dispatch, currentPage, pageSize, debouncedSearch ]);

  // user detail APIs
  useEffect(() => {
    if (selectedPostId) {
      dispatch(fetchPostById(selectedPostId));
    }
  }, [dispatch, selectedPostId]);

  // reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const paginationData = {
    currentPage: pagination?.currentPage ?? currentPage,
    itemsPerPage: pagination?.itemsPerPage ?? pageSize,
    totalPages: pagination?.totalPages ?? 1,
    setCurrentPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
    },
  };
  const router = useRouter();
  const handleViewPost = (postId: string) => {
    setSelectedPostId(postId);
    router.push(`/dashboard/post/${postId}`);
  };

  return (
    <div className="flex flex-col gap-4">

      <h1 className="text-2xl font-bold">Posts</h1>

      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <PostsTable
          posts={posts}
          pagination={paginationData}
          loading={loading}

          search={search}
          setSearch={setSearch}

          // accountStatus={accountStatus}
          // setAccountStatus={setAccountStatus}

          onViewPost={handleViewPost}
        />
      </div>
    </div>
  );
}