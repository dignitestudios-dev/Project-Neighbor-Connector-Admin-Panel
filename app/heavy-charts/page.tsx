'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  date: string;      // API se date
  users: number;     // API se users
  posts: number;     // API se posts
  circles: number;   // API se circles
}

interface HeavyChartsPageProps {
  charts: ChartData[];
  loading: boolean;
}

export default function HeavyChartsPage({ charts, loading }: HeavyChartsPageProps) {
  console.log("chats", charts);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500">Loading charts...</p>
      </div>
    );
  }

  if (!charts || charts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Trends</CardTitle>
          <CardDescription>Users, Posts & Circles over time</CardDescription>
        </CardHeader>
        <CardContent>
       <ResponsiveContainer width="95%" height={400}>
  <LineChart
    data={charts.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      }), // 07 Apr format
    }))}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip
      labelFormatter={(label) =>
        `Date: ${new Date(label).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}`
      }
    />
    <Legend />
    <Line type="monotone" dataKey="users" name="Users" stroke="#3b82f6" />
    <Line type="monotone" dataKey="posts" name="Posts" stroke="#ef4444" />
    <Line type="monotone" dataKey="circles" name="Circles" stroke="#10b981" />
  </LineChart>
</ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}