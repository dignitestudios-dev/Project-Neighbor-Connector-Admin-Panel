import { API } from "./axios";

// ✅ Get Circles
export const getCircles = async (params: any) => {
  const response = await API.get("/admin/circle", { params });
  return response.data;
};

// ✅ Get Circle By ID
export const getCircleById = async (id: string) => {
  const response = await API.get(`/admin/circle/${id}`);
  return response.data;
};

// ✅ Members
export const getCircleMembers = async (id: string) => {
  const response = await API.get(`/admin/circle/${id}/members`);
  return response.data;
};

// ✅ Posts
export const getCirclePosts = async (id: string) => {
  const response = await API.get(`/admin/circle/${id}/post`);
  return response.data;
};

// ✅ Update Name (🔥 IMPORTANT)
export const updateCircleName = async (id: string, name: string) => {
  try {
    const response = await API.put(`/admin/circle/${id}`, {
      name, // 👈 body
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update circle name"
    );
  }
};

// ✅ Update Invite
export const updateCircleInvite = async (id: string, name: string) => {
  try {
    const response = await API.put(`/admin/circle/invite-code/${id}`, {
      name,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update invite"
    );
  }
};

export const toggleCircleAdmin = async (id: string, userId: string, toggle: boolean) => {
  try {
    const response = await API.put(`/admin/circle/${id}/admin/toggle`, {
      user: userId,
      toggle: toggle,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to toggle admin"
    );
  }
};

export const removeMemberFromCircle = async (id: string, userId: string, toggle: boolean) => {
  try {
    const response = await API.put(`/admin/circle/${id}/members`, {
      user: userId,
      leave: toggle,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to toggle admin"
    );
  }
};