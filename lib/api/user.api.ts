import { API } from "./axios";

// ---------------- TYPES ----------------

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

// ---------------- USERS ----------------

// ✅ Get all users
export const getUsers = async (params: GetUsersParams = {}) => {
  try {
    const { page = 1, limit = 10, search = "" } = params;

    const response = await API.get("/admin/user", {
      params: { page, limit, search },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

// ✅ Get single user
export const getUserById = async (id: string) => {
  try {
    const response = await API.get(`/admin/user/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch user");
  }
};

// ---------------- EXTRA USER DATA ----------------

// ✅ Emergency Contacts
export const getUserEmergencyContacts = async (id: string) => {
  try {
    const response = await API.get(`/admin/user/${id}/emergency-contact`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch emergency contacts");
  }
};

// ✅ User Posts
export const getUserPosts = async (id: string) => {
  try {
    const response = await API.get(`/admin/user/${id}/post`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch posts");
  }
};

// ✅ Reported Posts (user ne jo report kiye)
export const getUserReported = async (id: string) => {
  try {
    const response = await API.get(`/admin/user/${id}/reported`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch reported items");
  }
};

// ✅ Reports Against User (user ke against reports)
export const getUserReports = async (id: string) => {
  try {
    const response = await API.get(`/admin/user/${id}/reports`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch reports");
  }
};

export const toggleUserBlock = async (id: string, toggle: boolean) => {
  try {
    const response = await API.put(`/admin/user/${id}/toggle/block`, {
      toggle, // 👈 true / false send hoga
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to toggle user block"
    );
  }
};