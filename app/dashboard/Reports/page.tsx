"use client";

import { useDispatch, useSelector } from "react-redux";
import { DataTable } from "./components/data-table";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchReportsStats,
  fetchReportsUsers,
  resolveReportThunk,
  
} from "@/lib/slices/reportsSlice";
import { Card } from "@/components/ui/card";

export default function Reports() {
  const dispatch = useDispatch<AppDispatch>();

  const { reports, pagination, loading , stats} = useSelector(
    (state: RootState) => state.report
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState("pending");
  const [type, setType] = useState("all");

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

  // ✅ Accept / Reject
  const handleAction = (id: string, action: "accept" | "reject") => {
    dispatch(resolveReportThunk({ id, action }));
  };

  // ✅ Fetch reports
  useEffect(() => {
    dispatch(fetchReportsStats());
    dispatch(
      fetchReportsUsers({
        page: currentPage,
        limit: pageSize,
        status,
        type,
      })
    );
  }, [dispatch, currentPage, pageSize, status, type]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Reports</h1>
<div>
  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <h2 className="text-sm text-gray-500">Pending Reports</h2>
          <p className="text-xl font-bold">{stats?.pendingReports || 0}</p>
        </Card>
  
       
  
        <Card className="p-4">
          <h2 className="text-sm text-gray-500">Resolved Reports</h2>
          <p className="text-xl font-bold">{stats?.resolvedReports || 0}</p>
        </Card>
  
        <Card className="p-4">
          <h2 className="text-sm text-gray-500">Chatroom Reports</h2>
          <p className="text-xl font-bold">{stats?.chatroomReports || 0}</p>
        </Card>
        <Card className="p-4">
          <h2 className="text-sm text-gray-500">Message Reports</h2>
          <p className="text-xl font-bold">{stats?.messageReports || 0}</p>
        </Card>
        <Card className="p-4">
          <h2 className="text-sm text-gray-500">Post Reports</h2>
          <p className="text-xl font-bold">{stats?.postReports || 0}</p>
        </Card>
        <Card className="p-4">
          <h2 className="text-sm text-gray-500">Comment Reports</h2>
          <p className="text-xl font-bold">{stats?.commentReports || 0}</p>
        </Card>
        <Card className="p-4">
          <h2 className="text-sm text-gray-500">User Reports</h2>
          <p className="text-xl font-bold">{stats?.userReports || 0}</p>
        </Card>
  
        
      </div>
</div>
      <DataTable
        pagination={paginationData}
        loading={loading}
        reports={reports}
        status={status}
        type={type}
        setStatus={setStatus}
        setType={setType}
        handleAction={handleAction}
      />
    </div>
  );
}