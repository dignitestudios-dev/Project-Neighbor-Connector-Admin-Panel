"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Post } from "@/lib/slices/postSlice";

interface PaginationData {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

interface PostsTableProps {
  posts: Post[];
  pagination: PaginationData;
  loading: boolean;
  search: string;
  setSearch: (val: string) => void;
  onViewPost: (id: string) => void;
}

const SkeletonRow = () => (
  <TableRow>
    {Array.from({ length: 6 }).map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
      </TableCell>
    ))}
  </TableRow>
);

const formatUsDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const toTitle = (value?: string) => {
  if (!value) return "N/A";
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
};

export function PostsTable({
  posts,
  pagination,
  loading,
  search,
  setSearch,
  onViewPost,
}: PostsTableProps) {
  const { currentPage, itemsPerPage, totalPages, totalItems, setCurrentPage, setPageSize } = pagination;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: "var(--primary-blue)" }} />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              <TableHead className="h-14 w-[210px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">Title</TableHead>
              <TableHead className="h-14 w-[180px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">User</TableHead>
              <TableHead className="h-14 text-[11px] font-semibold uppercase tracking-wide text-primary/70">Description</TableHead>
              <TableHead className="h-14 w-[140px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">Type</TableHead>
              <TableHead className="h-14 w-[130px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">Created Date</TableHead>
              <TableHead className="h-14 w-[110px] text-[11px] font-semibold uppercase tracking-wide text-primary/70">Pinned</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => <SkeletonRow key={i} />)
            ) : posts.length ? (
              posts.map((post) => (
                <TableRow
                  key={post._id}
                  className="cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() => onViewPost(post._id)}
                >
                  <TableCell className="font-medium">{post.title || "Untitled"}</TableCell>
                  <TableCell>{post.user?.name || "N/A"}</TableCell>
                  <TableCell className="truncate text-sm text-muted-foreground">
                    {post.description || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/40 text-primary">
                      {toTitle(post.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatUsDate(post.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={post.isPinned ? "border-primary/40 text-primary" : "border-primary/40 text-primary/70"}>
                      {post.isPinned ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No posts found.
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
              disabled={loading || currentPage <= 1}
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
