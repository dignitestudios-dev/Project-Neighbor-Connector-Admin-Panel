// /lib/api/dashboard.api.ts
import { API } from "./axios";
export interface DashboardStats {
  totalUser: number;
  totalCircle: number;
  totalCheckIn: number;
  totalCheckOut: number;
}


export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await API.get("/admin/dashboard");
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch dashboard stats");
  }
};

export const getDashboardCharts = async (endDate: string, startDate: string, type: string): Promise<any> => {
  try {
    const response = await API.get("/admin/dashboard/graph", {
      params: {
        endDate,
        startDate,
        type,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch dashboard charts");
  }
};
