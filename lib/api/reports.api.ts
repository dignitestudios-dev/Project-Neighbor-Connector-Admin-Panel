import { API } from "./axios";

// ---------------- Users Reports ----------------
interface GetReportsParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  
}

export const getReports = async (params: GetReportsParams = {}) => {
  try {
    const { page = 1, limit = 10, type, status } = params;

    const response = await API.get("/admin/reports", {
      params: {
        page,
        limit,
        type,
        status,
      
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch reports");
  }
};


export const getReportsStats = async () => {
  try {
    const response = await API.get("/admin/reports/dashboard");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch reports stats");
  }
};




export const resolveReport = async (id: string,status:string) => {
  const res = await API.put(`/admin/reports`, {id:id, action:status });
  return res.data;
};