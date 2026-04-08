
import { API } from "./axios";
interface GetPostsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getPosts = async (params: GetPostsParams = {}) => {
  try {
    const { page = 1, limit = 10, search = "" } = params;

    const response = await API.get("/admin/post", {
      params: { page, limit, search },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch posts");
  }
};

export const getPostById = async (id: string) => {
  try {
    const response = await API.get(`/admin/post/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch post");
  }
};

export const deletePostById = async (id: string) => {
  try {
    const response = await API.delete(`/admin/post/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete post"
    );
  }
};
export const getCommentById = async (id: string, circleId: string) => {
  try {
    const response = await API.get(`/admin/post/comments/${id}?circle=${circleId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to get comment");
  }
};

export const getCommentReplies = async (commentId: string) => {
  try {
    const response = await API.get(`/admin/post/comments/${commentId}/replies`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to get replies");
  }
};