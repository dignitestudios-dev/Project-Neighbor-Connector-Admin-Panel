"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye } from "lucide-react";
import { AppDispatch } from "@/lib/store";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchNotifications } from "@/lib/slices/notificationSlice";
import { Loader2 } from "lucide-react"; // 🔹 Make sure Loader2 is imported

interface DataTableProps {
  notifications: any[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    setPageSize: (size: number) => void;
  };
  loading: boolean;
}

export function DataTable({ notifications, pagination, loading }: DataTableProps) {
  
const dispatch = useDispatch<AppDispatch>();


  // Fetch notifications whenever page or pageSize changes
 

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    pagination.setPageSize(Number(e.target.value));
    pagination.setCurrentPage(1); // Reset to first page
  };

  const handlePreviousPage = () => {
    if (pagination.currentPage > 1) pagination.setCurrentPage(pagination.currentPage - 1);
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) pagination.setCurrentPage(pagination.currentPage + 1);
  };

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Scheduled At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
          
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <Loader2 className="animate-spin mx-auto text-gray-500" size={32} />
                </TableCell>
              </TableRow>
            ) : notifications
              .map((notification) => (
                <TableRow key={notification._id}>
                  <TableCell>{notification.title || "-"}</TableCell>
                  <TableCell>{notification.description || "-"}</TableCell>
                  <TableCell>
                    {notification.scheduledAt
                      ? new Date(notification.scheduledAt).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        notification.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {notification.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString()
                      : "-"}
                  </TableCell>
                
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={pagination.currentPage <= 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={pagination.currentPage >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}