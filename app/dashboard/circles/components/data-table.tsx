"use client";

import {
  EllipsisVertical,
  Eye,
  Trash2,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// ─── Types ─────────────────────────
interface Circle {
  _id: string;
  name: string;
  inviteCode: string;
  isActive: boolean;
  createdAt: string;
  usersCount: number;
}

interface PaginationData {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

interface DataTableProps {
  circles: Circle[];
  pagination: PaginationData;
  loading: boolean;
  search: string;
  setSearch: (val: string) => void;
  onViewCircle: (id: string) => void;
}

// ─── Skeleton ─────────────────────
const SkeletonRow = () => (
  <TableRow>
    {Array.from({ length: 6 }).map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
      </TableCell>
    ))}
  </TableRow>
);

// ─── Component ─────────────────────
export function DataTable({
  circles,
  pagination,
  loading,
  search,
  setSearch,
  onViewCircle,
}: DataTableProps) {
  const { currentPage, itemsPerPage, totalPages, setCurrentPage, setPageSize } =
    pagination;

  return (
    <div className="space-y-4">

      {/* 🔍 Search */}
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search circles..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // 🔥 reset page on search
          }}
          className="pl-9"
        />
      </div>

      {/* 📊 Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Invite Code</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            ) : circles.length ? (
              circles.map((circle) => (
                <TableRow key={circle._id}>
                  <TableCell>{circle.name}</TableCell>

                  <TableCell>
                    <Badge variant="outline">{circle.inviteCode}</Badge>
                  </TableCell>

                  <TableCell>{circle.usersCount}</TableCell>

                  <TableCell>
                    <Badge
                      className={
                        circle.isActive
                          ? "text-green-700 bg-green-50 border-green-200"
                          : "text-red-700 bg-red-50 border-red-200"
                      }
                    >
                      {circle.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(circle.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onViewCircle(circle._id)}
                      >
                        <Eye className="size-4" />
                      </Button>

                     
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No circles found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 📄 Pagination (same UI, fixed logic) */}
      <div className="flex items-center justify-between py-4">
        
        {/* Page Size */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Show</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(val) => {
              setPageSize(Number(val));
              setCurrentPage(1); // 🔥 fix
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={loading || currentPage === 1}
          >
            Previous
          </Button>

          <Button
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            // disabled={loading || currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}