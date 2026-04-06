"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { fetchDashboardStats } from "@/lib/slices/dashboardSlice";
import { AppDispatch, RootState } from "@/lib/store";

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading, error } = useSelector((state: RootState) => state.dashboard);
  console.log("stats", stats);
  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // if (loading) return <div className="flex items-center justify-center min-h-[200px]"><LoadingSpinner size="lg" /></div>;
  // if (error) return <div className="p-4 text-red-500">{error} heloooooooooooooo </div>;

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="p-4">
        <h2 className="text-sm text-gray-500">Total Users</h2>
        <p className="text-xl font-bold">{stats?.totalUser || 0}</p>
      </Card>

     

      <Card className="p-4">
        <h2 className="text-sm text-gray-500">Total Circle</h2>
        <p className="text-xl font-bold">{stats?.totalCircle || 0}</p>
      </Card>

      <Card className="p-4">
        <h2 className="text-sm text-gray-500">Total Check In</h2>
        <p className="text-xl font-bold">{stats?.totalCheckIn || 0}</p>
      </Card>
      <Card className="p-4">
        <h2 className="text-sm text-gray-500">Total Check Out</h2>
        <p className="text-xl font-bold">{stats?.totalCheckOut || 0}</p>
      </Card>

      
    </div>
  );
}