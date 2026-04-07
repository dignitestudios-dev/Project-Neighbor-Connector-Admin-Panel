"use client";

import { useDispatch, useSelector } from "react-redux";
import { DataTable } from "./components/data-table";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "@/lib/store";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  MessageCircle,
  Shield,
  Users,
} from "lucide-react";
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
  const [pageSize, setPageSize] = useState(30);
  const [status, setStatus] = useState("pending");
  const [type, setType] = useState("all");

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

  // ✅ Accept / Reject
  const handleAction = async (id: string, action: "accept" | "reject") => {
    await dispatch(resolveReportThunk({ id, action })).unwrap();
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

  const statsCards = [
    { label: "Pending Reports", value: stats?.pendingReports || 0, icon: AlertTriangle, color: "text-primary" },
    { label: "Resolved Reports", value: stats?.resolvedReports || 0, icon: CheckCircle2, color: "text-[var(--primary-blue)]" },
    { label: "Post Reports", value: stats?.postReports || 0, icon: FileText, color: "text-primary" },
    { label: "Comment Reports", value: stats?.commentReports || 0, icon: MessageCircle, color: "text-[var(--primary-blue)]" },
    { label: "User Reports", value: stats?.userReports || 0, icon: Users, color: "text-primary" },
    { label: "Chatroom Reports", value: stats?.chatroomReports || 0, icon: Shield, color: "text-[var(--primary-blue)]" },
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Reports</h1>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((card) => (
          <Card key={card.label} className="rounded-xl border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold">{card.value}</p>
              </div>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </Card>
        ))}
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
