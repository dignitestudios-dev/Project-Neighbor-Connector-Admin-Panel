"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchPosts } from "@/lib/slices/postSlice";

import { RootState, AppDispatch } from "@/lib/store";
import { PostsTable } from "./components/data-table";
import { useRouter } from "next/navigation";
export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { posts, pagination, loading } = useSelector((state: RootState) => state.posts);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(
      fetchPosts({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
      })
    );
  }, [dispatch, currentPage, pageSize, debouncedSearch]);

  const paginationData = {
    currentPage: pagination?.currentPage ?? currentPage,
    itemsPerPage: pagination?.itemsPerPage ?? pageSize,
    totalPages: pagination?.totalPages ?? 1,
    totalItems: pagination?.totalItems ?? 0,
    setCurrentPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
    },
  };
  const router = useRouter();
  const handleViewPost = (postId: string) => {
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
          setSearch={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          onViewPost={handleViewPost}
        />
      </div>
    </div>
  );
}
