import { API } from "./axios";
import { AxiosError } from "axios";

// ---------------- TYPES ----------------

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface ListParams {
  page?: number;
  limit?: number;
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as AxiosError<{ message?: string }>;
  return apiError.response?.data?.message || fallback;
};

// ---------------- USERS ----------------

// ✅ Get all users
export const getUsers = async (params: GetUsersParams = {}) => {
  try {
    const { page = 1, limit = 10, search = "" } = params;

    const response = await API.get("/admin/user", {
      params: { page, limit, search },
    });

    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch users"));
  }
};

// ✅ Get single user
export const getUserById = async (id: string) => {
  try {
    const response = await API.get(`/admin/user/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch user"));
  }
};

// ---------------- EXTRA USER DATA ----------------

// ✅ Emergency Contacts
export const getUserEmergencyContacts = async (id: string) => {
  try {
    const response = await API.get(`/admin/user/${id}/emergency-contact`);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch emergency contacts"));
  }
};

// ✅ User Posts
export const getUserPosts = async (id: string, params: ListParams = {}) => {
  try {
    const { page = 1, limit = 10 } = params;
    const response = await API.get(`/admin/user/${id}/post`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch posts"));
  }
};

// ✅ Reported Posts (user ne jo report kiye)
export const getUserReported = async (id: string, params: ListParams = {}) => {
  try {
    const { page = 1, limit = 10 } = params;
    const response = await API.get(`/admin/user/${id}/reported`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch reported items"));
  }
};

// ✅ Reports Against User (user ke against reports)
export const getUserReports = async (id: string, params: ListParams = {}) => {
  try {
    const { page = 1, limit = 10 } = params;
    const response = await API.get(`/admin/user/${id}/reports`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch reports"));
  }
};

export const toggleUserBlock = async (id: string, toggle: boolean) => {
  try {
    const response = await API.put(`/admin/user/${id}/toggle/block`, {
      toggle, // 👈 true / false send hoga
    });

    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to toggle user block"));
  }
};
