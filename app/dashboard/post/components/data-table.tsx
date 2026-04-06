"use client";

import { useRouter } from "next/navigation";
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
import { Eye, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Post } from "@/lib/slices/postSlice";

// ─── Types ────────────────────────────────────────────────────────────────

interface PaginationData {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
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

// ─── Skeleton Row ────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <TableRow>
    {Array.from({ length: 6 }).map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
      </TableCell>
    ))}
  </TableRow>
);

// ─── Main Component ──────────────────────────────────────────────────────

export function PostsTable({
  posts,
  pagination,
  loading,
  search,
  setSearch,
  onViewPost,
}: PostsTableProps) {
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
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
        
            
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            ) : posts.length ? (
              posts.map((post) => (
                <TableRow key={post._id}>
                  <TableCell>{post.title || "Untitled"}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {post.description
                      ? post.description.split(" ").slice(0, 10).join(" ") +
                        (post.description.split(" ").length > 10 ? "..." : "")
                      : "—"}
                  </TableCell>
                  <TableCell>{post.date || "—"}</TableCell>
                  <TableCell>{post.time || "—"}</TableCell>
                 <TableCell>{post.type || "—"}</TableCell>
                 
                 
                 
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                      onClick={() => router.push(`/dashboard/post/${post._id}`)}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No posts found.
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