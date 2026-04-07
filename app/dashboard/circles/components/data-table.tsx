"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
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
  totalItems?: number;
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

const SkeletonRow = () => (
  <TableRow>
    {Array.from({ length: 5 }).map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
      </TableCell>
    ))}
  </TableRow>
);

const formatUsDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

export function DataTable({
  circles,
  pagination,
  loading,
  search,
  setSearch,
  onViewCircle,
}: DataTableProps) {
  const { currentPage, itemsPerPage, totalPages, totalItems = 0, setCurrentPage, setPageSize } =
    pagination;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
            style={{ color: "var(--primary-blue)" }}
          />
          <Input
            placeholder="Search circles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
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
              <TableHead className="h-14 w-[240px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">Name</TableHead>
              <TableHead className="h-14 w-[220px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">Invite Code</TableHead>
              <TableHead className="h-14 w-[100px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">Users</TableHead>
              <TableHead className="h-14 w-[130px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">Status</TableHead>
              <TableHead className="h-14 w-[140px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => <SkeletonRow key={i} />)
            ) : circles.length ? (
              circles.map((circle) => (
                <TableRow
                  key={circle._id}
                  className="cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() => onViewCircle(circle._id)}
                >
                  <TableCell className="font-medium">{circle.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        {circle.inviteCode}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={async (event) => {
                          event.stopPropagation();
                          await navigator.clipboard.writeText(circle.inviteCode);
                          setCopiedId(circle._id);
                          setTimeout(() => setCopiedId(null), 1200);
                        }}
                        aria-label="Copy invite code"
                        title="Copy invite code"
                        style={{ color: "var(--primary-blue)" }}
                      >
                        {copiedId === circle._id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{circle.usersCount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={circle.isActive ? "border-primary/40 text-primary" : "border-primary/40 text-primary/70"}
                    >
                      {circle.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatUsDate(circle.createdAt)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No circles found
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
            onValueChange={(val) => {
              setPageSize(Number(val));
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
            disabled={loading || currentPage === 1}
            aria-label="Previous page"
            className="cursor-pointer"
          >
            <ChevronLeft className="size-4" style={{ color: "var(--primary-blue)" }} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={loading || currentPage >= totalPages}
            aria-label="Next page"
            className="cursor-pointer"
          >
            <ChevronRight className="size-4" style={{ color: "var(--primary-blue)" }} />
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
