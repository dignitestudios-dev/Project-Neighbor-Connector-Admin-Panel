import { API } from "./axios"; 


export const getNotification = async (page = 1, limit = 10, search = "") => {
    try {
        const response = await API.get("/notification/admin", {
            params: {
                page,
                limit,
                search,
            },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch notifications");
    }
};


export const createNotification = async (data: any) => {
    try {
        const response = await API.post("/notification", data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to create notification");
    }
};

export const markAllNotificationsReadApi = async () => {
    try {
        const response = await API.post("/notification/all");
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to mark all notifications as read");
    }
};

export const deleteAllNotificationsApi = async () => {
    try {
        const response = await API.delete("/notification/all");
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to delete all notifications");
    }
};

