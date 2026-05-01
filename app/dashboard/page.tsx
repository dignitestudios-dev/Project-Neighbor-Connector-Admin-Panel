"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { fetchDashboardStats, fetchDashboardCharts } from "@/lib/slices/dashboardSlice";
import { AppDispatch, RootState } from "@/lib/store";
import HeavyChartsPage from "../heavy-charts/page";
import { CalendarDays, CheckCircle, CheckCircle2, CircleDot, Users } from "lucide-react";

const DashboardStatsSkeleton = () => (
  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={index} className="rounded-xl border p-4">
        <div className="space-y-3">
          <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
          <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
        </div>
      </Card>
    ))}
  </div>
);

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, charts, loading } = useSelector((state: RootState) => state.dashboard);

  const defaultDates = (() => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 7);
    const format = (date: Date) => date.toISOString().split("T")[0];
    return { start: format(past), end: format(today) };
  })();

  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);

  useEffect(() => {
    dispatch(fetchDashboardStats());

    dispatch(
      fetchDashboardCharts({
        startdate: defaultDates.start,
        enddate: defaultDates.end,
        type: "custom",
      })
    );
  }, [dispatch, defaultDates.end, defaultDates.start]);

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

  const statsCards = [
    { label: "Total Users", value: stats?.totalUser || 0, icon: Users, color: "text-primary" },
    { label: "Total Circles", value: stats?.totalCircle || 0, icon: CircleDot, color: "text-[var(--primary-blue)]" },
    { label: "Total Check In", value: stats?.totalCheckIn || 0, icon: CheckCircle2, color: "text-primary" },
    // { label: "Total Check Out", value: stats?.totalCheckOut || 0, icon: CheckCircle , color: "text-[var(--primary-blue)]" },
  ];

  const statsLoading = !stats && loading;

  return (
    <div>
      {statsLoading ? (
        <DashboardStatsSkeleton />
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card) => (
            <Card key={card.label} className="rounded-xl border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                </div>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-end justify-end gap-3 rounded-xl border p-4">
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-muted-foreground">Start Date</label>
          <input
            type="date"
            value={startDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-muted-foreground">End Date</label>
          <input
            type="date"
            value={endDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={handleFilter}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Apply
        </button>
      </div>

      <div className="rounded-xl border p-4">
        <HeavyChartsPage charts={charts} loading={loading} />
      </div>
    </div>
  );
}
