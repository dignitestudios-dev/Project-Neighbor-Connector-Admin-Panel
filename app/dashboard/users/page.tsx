"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchUsers,
  fetchUserById,
  fetchUserPosts,
  fetchUserEmergencyContacts,
  fetchUserReported,
  fetchUserReports,
} from "@/lib/slices/userSlice";

import { RootState, AppDispatch } from "@/lib/store";
import { DataTable } from "./components/data-table";

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    users,
    pagination,
    loading,
  } = useSelector((state: RootState) => state.users);
  console.log("users", users);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [accountStatus, setAccountStatus] = useState<"all" | "active" | "deactivated">("all");

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
      fetchUsers({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
        // accountStatus: accountStatus === "all" ? undefined : accountStatus,
      })
    );
  }, [dispatch, currentPage, pageSize, debouncedSearch ]);

  // user detail APIs
  useEffect(() => {
    if (selectedUserId) {
      dispatch(fetchUserById(selectedUserId));
      dispatch(fetchUserPosts(selectedUserId));
      dispatch(fetchUserEmergencyContacts(selectedUserId));
      dispatch(fetchUserReported(selectedUserId));
      dispatch(fetchUserReports(selectedUserId));
    }
  }, [dispatch, selectedUserId]);

  // reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

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

  return (
    <div className="flex flex-col gap-4">

      <h1 className="text-2xl font-bold">Users</h1>

      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <DataTable
          users={users}
          pagination={paginationData}
          loading={loading}

          search={search}
          setSearch={setSearch}

          accountStatus={accountStatus}
          setAccountStatus={setAccountStatus}

          onViewUser={(id: string) => setSelectedUserId(id)}
        />
      </div>
    </div>
  );
}
