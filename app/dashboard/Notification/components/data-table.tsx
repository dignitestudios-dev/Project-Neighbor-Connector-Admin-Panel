"use client";

import { useState } from "react";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationItem {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface DataTableProps {
  notifications: NotificationItem[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    setPageSize: (size: number) => void;
  };
  loading: boolean;
}

const truncate = (value: string, max = 110) => {
  if (!value) return "-";
  if (value.length <= max) return value;
  return `${value.slice(0, max)}...`;
};

const formatUsDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const SkeletonRow = () => (
  <TableRow>
    {Array.from({ length: 4 }).map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
      </TableCell>
    ))}
  </TableRow>
);

export function DataTable({ notifications, pagination, loading }: DataTableProps) {
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  return (
    <div className="w-full space-y-4">
      <div className="rounded-xl border">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="h-14 w-[220px] text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--primary-blue)" }}>Title</TableHead>
              <TableHead className="h-14 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--primary-blue)" }}>Description</TableHead>
              <TableHead className="h-14 w-[170px] text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--primary-blue)" }}>Created At</TableHead>
              <TableHead className="h-14 w-[100px] text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--primary-blue)" }}>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pagination.itemsPerPage }).map((_, i) => <SkeletonRow key={i} />)
            ) : notifications.length ? (
              notifications.map((notification) => (
                <TableRow key={notification._id}>
                  <TableCell className="font-medium">{notification.title || "-"}</TableCell>
                  <TableCell>
                    <span className="block max-w-full truncate" title={notification.description}>
                      {truncate(notification.description)}
                    </span>
                  </TableCell>
                  <TableCell>{formatUsDateTime(notification.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedNotification(notification)}
                      style={{ color: "var(--primary-blue)" }}
                      aria-label="View notification"
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No notifications found.
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
            value={pagination.itemsPerPage.toString()}
            onValueChange={(val) => {
              pagination.setPageSize(Number(val));
              pagination.setCurrentPage(1);
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
            Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong>
          </p>
          <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.setCurrentPage(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            aria-label="Previous page"
            className="cursor-pointer"
          >
            <ChevronLeft className="size-4" style={{ color: "var(--primary-blue)" }} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.setCurrentPage(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            aria-label="Next page"
            className="cursor-pointer"
          >
            <ChevronRight className="size-4" style={{ color: "var(--primary-blue)" }} />
          </Button>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(selectedNotification)} onOpenChange={(open) => !open && setSelectedNotification(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--primary-blue)" }}>
              {selectedNotification?.title || "Notification"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Created At: {formatUsDateTime(selectedNotification?.createdAt)}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border p-3 text-sm leading-6">
            {selectedNotification?.description || "-"}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
