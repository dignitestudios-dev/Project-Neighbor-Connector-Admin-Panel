"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Check, Eye, X, AlertTriangle, MessageSquare, Calendar, RefreshCw, Info, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportUser {
  _id: string;
  fullName: string;
  username: string;
  emailAddress: string;
  reason: string;
  description: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;

  // ✅ ADD THESE (no keyword change)
  reported?: {
    name?: string;
    bio?: string;
  };

  reportedBy?: {
    name?: string;
    email?: string;
  };
}

interface DataTableProps {
  reports: ReportUser[];
  loading: boolean;
  pagination: any;
  status: string;
  type: string;
  setStatus: (status: string) => void;
  setType: (type: string) => void;
  handleAction: (id: string, action: "accept" | "reject") => void;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable({
  reports,
  pagination,
  loading,
  status,
  type,
  setStatus,
  setType,
  handleAction,
}: DataTableProps) {

  // Modal state
  const [selectedReport, setSelectedReport] = useState<ReportUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log("selectedReport", selectedReport);
  const handleView = (report: ReportUser) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    pagination.setPageSize(Number(e.target.value));
    pagination.setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (pagination.currentPage > 1)
      pagination.setCurrentPage(pagination.currentPage - 1);
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages)
      pagination.setCurrentPage(pagination.currentPage + 1);
  };
  const router = useRouter();
  return (
    <div className="w-full space-y-4">

      {/* ── Filters ── */}
      <div className={`grid gap-2 sm:grid-cols-3 sm:gap-4`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); pagination.setCurrentPage(1); }}
              className="w-full border rounded px-2 py-1"
            >
              <option value="all">All</option>
              <option value="post">Post</option>
              <option value="comment">Comment</option>
              <option value="user">User</option>
              <option value="chatroom">Chatroom</option>
              <option value="circle">Circle</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); pagination.setCurrentPage(1); }}
              className="w-full border rounded px-2 py-1"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="resolve">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reported By</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <LoadingSpinner size="md" />
                </TableCell>
              </TableRow>
            ) : reports?.length ? (
              reports.map((report: ReportUser) => (
                <TableRow key={report._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{report.fullName?.[0] || report.username?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{report.fullName}</div>
                        <div className="text-sm text-gray-500">{report.emailAddress}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="capitalize">{report.type}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>

                  <TableCell>
                    <Badge
                      className="capitalize"
                      variant="secondary"
                    >
                      Pending
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className="capitalize"
                      variant={
                        report.status === "resolve" ? "default" :
                        report.status === "reject" ? "destructive" : "secondary"
                      }
                    >
                      {report.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="flex gap-2">
                    {/* 👁 VIEW → modal khulega */}
                    <Button onClick={() => handleView(report)} size="icon" variant="ghost">
                      <Eye className="size-4" />
                    </Button>

                    {report.status === "pending" && (
                      <>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleAction(report._id, "accept")}
                        >
                          <Check className="size-4 text-green-600" />
                        </Button>

                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleAction(report._id, "reject")}
                        >
                          <X className="size-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No results</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Items per page:</span>
          <select
            value={pagination.itemsPerPage}
            onChange={handlePageSizeChange}
            className="border rounded px-2 py-1 text-sm"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={pagination.currentPage <= 1}>
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={pagination.currentPage >= pagination.totalPages}>
            Next
          </Button>
        </div>
      </div>

      {/* ── Report Detail Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-semibold">Report Detail</DialogTitle>
              {selectedReport && (
                <Badge
                  className={`text-xs font-medium border ${
                    selectedReport.status === "resolve"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : selectedReport.status === "reject"
                      ? "bg-red-100 text-red-700 border-red-200"
                      : "bg-yellow-100 text-yellow-700 border-yellow-200"
                  }`}
                >
                  {selectedReport.status}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 px-5 pb-5 pt-4 max-h-[75vh] overflow-y-auto">

              {/* Meta info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: AlertTriangle, label: "Reason", value: selectedReport.reason },
                  { icon: MessageSquare, label: "Type", value: selectedReport.type },
                  { icon: Info, label: "Description", value: selectedReport?.reported?.bio },
                  { icon: User, label: "Username", value: selectedReport?.reported?.name },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium capitalize">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Reported By */}
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Reported By</p>
                <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                      {selectedReport.reportedBy?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{selectedReport.reportedBy?.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedReport.reportedBy?.email}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Calendar, label: "Created At", value: formatDate(selectedReport.createdAt) },
                  { icon: RefreshCw, label: "Updated At", value: formatDate(selectedReport.updatedAt) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
