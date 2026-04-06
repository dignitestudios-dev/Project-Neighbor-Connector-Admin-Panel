"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { fetchDashboardStats, fetchDashboardCharts } from "@/lib/slices/dashboardSlice";
import { AppDispatch, RootState } from "@/lib/store";
import HeavyChartsPage from "../heavy-charts/page";

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { stats, charts, loading, error } = useSelector(
    (state: RootState) => state.dashboard
  );
// console.log("charts", charts);
  // ✅ Filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ Default load (last 7 days)
  useEffect(() => {
    dispatch(fetchDashboardStats());

    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 7);

    const format = (d: Date) => d.toISOString().split("T")[0];

    const start = format(past);
    const end = format(today);

    setStartDate(start);
    setEndDate(end);

    dispatch(
      fetchDashboardCharts({
        startdate: start,
        enddate: end,
        type: "custom",
      })
    );
  }, [dispatch]);

  // ✅ Filter handler
  const handleFilter = () => {
    if (!startDate || !endDate) return;

    dispatch(
      fetchDashboardCharts({
        startdate: startDate,
        enddate: endDate,
        type: "custom",
      })
    );
  };

  return (
    <div>
      {/* ✅ FILTER UI */}
      

      {/* ✅ STATS CARDS */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
<div className="flex gap-3 p-4 items-center justify-end">
      <input
    type="date"
    value={startDate}
    max={new Date().toISOString().split("T")[0]} // ✅ max today
    onChange={(e) => setStartDate(e.target.value)}
    className="border px-2 py-1 rounded"
  />

  <input
    type="date"
    value={endDate}
    max={new Date().toISOString().split("T")[0]} // ✅ max today
    onChange={(e) => setEndDate(e.target.value)}
    className="border px-2 py-1 rounded"
  />

  <button
    onClick={handleFilter}
    className="bg-primary hover:bg-primary/80 text-white px-3 py-1 rounded"
  >
    Apply
  </button>
</div>
     
      {/* ✅ CHART */}
      <div className="p-4">
        <HeavyChartsPage charts={charts} loading={loading} />
      </div>
    </div>
  );
}