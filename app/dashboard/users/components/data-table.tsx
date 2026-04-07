"use client";

import {
  Eye,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  Mail,
  UserRound,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useRouter } from "next/navigation";
import { ApiUser } from "@/lib/slices/userSlice";

interface PaginationData {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems?: number;
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

const getInitials = (name: string | null, email: string): string => {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0]?.toUpperCase() ?? "U";
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

const getCheckInStatusStyle = (status: string | null | undefined) => {
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

const getJoinedGroupStyle = (joinedGroup: boolean | null | undefined) => {
  if (joinedGroup === true) return "text-green-700 bg-green-50 border-green-200";
  if (joinedGroup === false) return "text-gray-600 bg-gray-50 border-gray-200";
  return "text-gray-500 bg-gray-50 border-gray-200";
};

const SkeletonRow = () => (
  <TableRow>
    {Array.from({ length: 8 }).map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
      </TableCell>
    ))}
  </TableRow>
);

export function DataTable({
  users,
  pagination,
  loading,
  search,
  setSearch,
}: DataTableProps) {
  const { currentPage, itemsPerPage, totalPages, totalItems = 0, setCurrentPage, setPageSize } =
    pagination;
  const router = useRouter();
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{startItem}-{endItem}</span> of{" "}
          <span className="font-medium text-foreground">{totalItems}</span> users
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Joined Group</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => <SkeletonRow key={i} />)
            ) : users.length ? (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-xs font-medium text-blue-700">
                          {getInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <UserRound className="size-3.5 text-muted-foreground" />
                          {user.name ?? (
                            <span className="text-sm italic text-muted-foreground">No name</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <Mail className="size-3.5 text-muted-foreground" />
                      {user.email}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <Phone className="size-3.5 text-muted-foreground" />
                      {user.phoneNumber ?? <span className="text-muted-foreground">N/A</span>}
                    </span>
                  </TableCell>

                  <TableCell className="max-w-[280px]">
                    <span className="inline-flex items-start gap-1.5 text-sm">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <span className="line-clamp-2">
                        {user.homeAddress ?? user.address ?? (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </span>
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={getCheckInStatusStyle(user.lastCheckInStatus)}>
                      {user.lastCheckInStatus ?? "N/A"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={getJoinedGroupStyle(user.joinedGroup)}>
                      {user.joinedGroup ? (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <XCircle className="size-3.5" />
                          No
                        </span>
                      )}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getAccountStatusStyle(user.accountStatus ?? "Inactive")}
                    >
                      {user.accountStatus ?? "N/A"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
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
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Show</Label>
          <Select value={itemsPerPage.toString()} onValueChange={(val) => setPageSize(Number(val))}>
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
              className="cursor-pointer"
            >
              <ChevronLeft className="mr-1 size-4" />
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
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
