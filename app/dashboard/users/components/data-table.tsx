"use client";

import {
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
  Download,
  Search,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useRouter } from "next/navigation";
import { ApiUser } from "@/lib/slices/userSlice";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaginationData {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

interface DataTableProps {
  users: ApiUser[];
  pagination: PaginationData;
  loading: boolean;

  search: string;
  setSearch: (val: string) => void;

  accountStatus: "all" | "active" | "deactivated";
  setAccountStatus: (val: "all" | "active" | "deactivated") => void;

  onViewUser: (id: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string | null, email: string): string => {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
};

const getAccountStatusStyle = (status: string) => {
  switch (status) {
    case "Active":
      return "text-green-700 bg-green-50 border-green-200";
    case "Inactive":
      return "text-gray-600 bg-gray-50 border-gray-200";
    case "Suspended":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const getCheckInStatusStyle = (status: string | null) => {
  switch (status) {
    case "Completed":
      return "text-green-700 bg-green-50 border-green-200";
    case "Missed":
      return "text-red-600 bg-red-50 border-red-200";
    case "Pending":
      return "text-orange-600 bg-orange-50 border-orange-200";
    default:
      return "text-gray-400 bg-gray-50 border-gray-200";
  }
};
// ─── Skeleton Row ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <TableRow>
    {Array.from({ length: 6 }).map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
      </TableCell>
    ))}
  </TableRow>
);


// ─── Main Component ───────────────────────────────────────────────────────────

export function DataTable({
  users,
  pagination,
  loading,
  search,
  setSearch,
  // accountStatus,
  // setAccountStatus,
  onViewUser,
}: DataTableProps) {
  const { currentPage, itemsPerPage, totalPages, setCurrentPage, setPageSize } =
  pagination;
  const router = useRouter();
  return (
    <div className="w-full space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* <Button variant="outline" className="cursor-pointer w-fit">
          <Download className="mr-2 size-4" />
          Export
        </Button> */}
      </div>

      {/* Filters */}
      {/* <div className="grid gap-2 sm:grid-cols-3 sm:gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Account Status</Label>
          <Select
            value={accountStatus}
            onValueChange={(val) =>
              setAccountStatus(val as "all" | "active" | "deactivated")
            }
          >
            <SelectTrigger className="cursor-pointer w-full">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="deactivated">Deactivated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div> */}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Phone</TableHead>
              
            
              <TableHead>Account Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            ) : users.length ? (
              users.map((user) => (
                <TableRow key={user._id}>
                  {/* User */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-700">
                          {getInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.name ?? (
                            <span className="text-muted-foreground italic text-sm">
                              No name
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Phone */}
                  <TableCell>
                    <span className="text-sm">
                      {user.phoneNumber ?? (
                        <span className="text-muted-foreground">{user.phoneNumber}</span>
                      )}
                    </span>
                  </TableCell>

                 

                  {/* Joined Group */}
                 

                  {/* Account Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={user.isDeactivatedByAdmin ? "text-red-600 bg-red-50 border-red-200" : "text-green-700 bg-green-50 border-green-200"}
                    >
                      {user.isDeactivatedByAdmin ? "Deactivated" : "Active"}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                        onClick={() => router.push(`/dashboard/users/${user._id}`)}
                      >
                        <Eye className="size-4" />
                        <span className="sr-only">View user</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Show</Label>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(val) => setPageSize(Number(val))}
          >
            <SelectTrigger className="w-20 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4">
          <p className="hidden sm:block text-sm text-muted-foreground">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
