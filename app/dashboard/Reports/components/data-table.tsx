"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
  Loader2,
  User,
  X,
} from "lucide-react";

interface ReportUser {
  _id: string;
  reason: string;
  status: string;
  type: string;
  createdAt: string;
  reported?: {
    _id?: string;
    name?: string;
    title?: string;
    description?: string;
  };
  reportedBy?: {
    _id?: string;
    name?: string;
    email?: string;
    profilePicture?: string;
  };
  targetModel?: string;
}

interface PaginationData {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems?: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

interface DataTableProps {
  reports: ReportUser[];
  loading: boolean;
  pagination: PaginationData;
  status: string;
  type: string;
  setStatus: (status: string) => void;
  setType: (type: string) => void;
  handleAction: (id: string, action: "accept" | "reject") => Promise<void> | void;
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toTitle = (value?: string) => (value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "N/A");

const getReportedEntityName = (report: ReportUser) =>
  report.reported?.name || report.reported?.title || report.targetModel || "N/A";

const getReportedEntityDetails = (report: ReportUser) =>
  report.reported?.description || report.reason || "No details available";

const SkeletonRow = () => (
  <TableRow>
    {Array.from({ length: 6 }).map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
      </TableCell>
    ))}
  </TableRow>
);

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
  const [selectedReport, setSelectedReport] = useState<ReportUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<{ id: string; action: "accept" | "reject" } | null>(null);
  const { currentPage, itemsPerPage, totalPages, totalItems = 0, setCurrentPage, setPageSize } = pagination;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="post">Post</SelectItem>
                <SelectItem value="comment">Comment</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="chatroom">Chatroom</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolve">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{startItem}-{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span>
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="h-14 w-[250px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">Reported By</TableHead>
              <TableHead className="h-14 w-[140px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">Type</TableHead>
              <TableHead className="h-14 text-[11px] font-semibold uppercase tracking-wide text-primary/70">Reason</TableHead>
              <TableHead className="h-14 w-[170px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">Date</TableHead>
              <TableHead className="h-14 w-[120px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">Status</TableHead>
              <TableHead className="h-14 w-[150px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => <SkeletonRow key={i} />)
            ) : reports?.length ? (
              reports.map((report) => (
                <TableRow key={report._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-medium text-primary">
                          {report.reportedBy?.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{report.reportedBy?.name || "Unknown User"}</p>
                        <p className="text-xs text-muted-foreground">{report.reportedBy?.email || "No email"}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="border-primary/40 text-primary">
                      {toTitle(report.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.reason || "N/A"}</TableCell>
                  <TableCell>{formatDate(report.createdAt)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        report.status === "resolve"
                          ? "border-primary/40 text-primary"
                          : report.status === "reject"
                            ? "border-primary/40 text-[var(--primary-blue)]"
                            : "border-primary/40 text-primary"
                      }
                    >
                      {toTitle(report.status)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Button
                        onClick={() => {
                          setSelectedReport(report);
                          setIsModalOpen(true);
                        }}
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 border-primary/30"
                      >
                        <Eye className="size-4" style={{ color: "var(--primary-blue)" }} />
                      </Button>

                      {report.status === "pending" && (
                        <>
                          {(() => {
                            const rowBusy = activeAction?.id === report._id;
                            const acceptLoading = rowBusy && activeAction?.action === "accept";
                            const rejectLoading = rowBusy && activeAction?.action === "reject";
                            return (
                              <>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-primary/30"
                            disabled={rowBusy}
                            onClick={async () => {
                              try {
                                setActiveAction({ id: report._id, action: "accept" });
                                await handleAction(report._id, "accept");
                              } finally {
                                setActiveAction(null);
                              }
                            }}
                          >
                            {acceptLoading ? (
                              <Loader2 className="size-4 animate-spin text-primary" />
                            ) : (
                              <Check className="size-4 text-primary" />
                            )}
                          </Button>

                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-primary/30"
                            disabled={rowBusy}
                            onClick={async () => {
                              try {
                                setActiveAction({ id: report._id, action: "reject" });
                                await handleAction(report._id, "reject");
                              } finally {
                                setActiveAction(null);
                              }
                            }}
                          >
                            {rejectLoading ? (
                              <Loader2 className="size-4 animate-spin" style={{ color: "var(--primary-blue)" }} />
                            ) : (
                              <X className="size-4" style={{ color: "var(--primary-blue)" }} />
                            )}
                          </Button>
                              </>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Show</Label>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="10">10</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-3">
          <p className="text-sm text-muted-foreground">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" style={{ color: "var(--primary-blue)" }} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" style={{ color: "var(--primary-blue)" }} />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl rounded-2xl p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-base font-semibold">Report Details</DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5">
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                  <Badge variant="outline" className="mt-2 border-primary/40 text-primary">
                    {toTitle(selectedReport.status)}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Created</p>
                  <p className="mt-2 text-sm font-medium">{formatDate(selectedReport.createdAt)}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <User className="h-3.5 w-3.5" /> Reported By
                  </p>
                  <p className="text-sm font-semibold">{selectedReport.reportedBy?.name || "Unknown User"}</p>
                  <p className="text-xs text-muted-foreground">{selectedReport.reportedBy?.email || "No email"}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5" /> Report Type
                  </p>
                  <p className="text-sm font-semibold">{toTitle(selectedReport.type)}</p>
                  <p className="text-xs text-muted-foreground">{selectedReport.targetModel || "N/A"}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 rounded-xl border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Reason</p>
                <p className="text-sm font-medium">{selectedReport.reason || "N/A"}</p>
              </div>

              <div className="space-y-3 rounded-xl border p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <Info className="h-3.5 w-3.5" /> Reported Entity
                </p>
                <p className="text-sm font-semibold">{getReportedEntityName(selectedReport)}</p>
                <p className="text-sm text-muted-foreground">{getReportedEntityDetails(selectedReport)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
