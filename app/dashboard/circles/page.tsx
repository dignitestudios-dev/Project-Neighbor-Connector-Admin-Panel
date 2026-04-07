"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { DataTable } from "./components/data-table";
import { fetchCircles } from "@/lib/slices/circleSlice";
import { useRouter } from "next/navigation";

export default function CirclesPage() {
  const dispatch = useDispatch<AppDispatch>();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const router = useRouter();
  const { pagination, loading, circles } = useSelector(
    (state: RootState) => state.circles
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(
      fetchCircles({
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
    setPageSize,
  };

  const handleView = (id: string) => {
    router.push(`/dashboard/circles/${id}`);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Circles</h1>

      <DataTable
        circles={circles}
        loading={loading}
        pagination={paginationData}
        search={search}
        setSearch={setSearch}
        onViewCircle={handleView}
      />
    </div>
  );
}
