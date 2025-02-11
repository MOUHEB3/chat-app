import axios from "axios";
// import FormData from "form-data";

// Axios instance for API requests
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
  timeout: 120000,
});

apiClient.interceptors.request.use(
  (config) => {
    // Retrieve token from localStorage
    const token = localStorage.getItem("token");

    // Ensure token is valid before setting Authorization header
    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (err) => Promise.reject(err)
);

export const loginUser = (data) => {
  return apiClient.post("/auth/login", data);
};

export const registerUser = (data) => {
  return apiClient.post("/auth/register", data);
};

export const logoutUser = () => {
  return apiClient.post("/auth/logout");
};

export const getAvailableUsers = (usernameOrEmail) => {
  return apiClient.get(`/api/chat/users?userId=${usernameOrEmail}`);
};

// Create a new one-to-one chat
export const createOneToOneChat = (receiverId) => {
  if (!receiverId) {
    return Promise.reject(new Error("Receiver ID is required"));
  }
  return apiClient.post(`/api/chat/c/${receiverId}`);
};

// Get all the current user chats
export const getAllcurrentUserChats = () => {
  return apiClient.get("/api/chat");
};

// Get chat messages
export const getChatMessages = (chatId) => {
  return apiClient.get(`/api/messages/${chatId}`);
};

// Send a message
export const sendMessage = (chatId, content, attachments) => {
  const formData = new FormData();
  if (content) {
    formData.append("content", content);
  }

  if (attachments) {
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  return apiClient.post(`/api/messages/${chatId}`, formData);
};

// Create group chat
export const createGroupChat = (name, participants) => {
  return apiClient.post("/api/chat/group", { name, participants });
};

// Delete a message
export const deleteMessage = (messageId) => {
  return apiClient.delete(`/api/messages/${messageId}`);
};

// Delete a chat
export const deleteChat = (chatId) => {
  return apiClient.delete(`/api/chat/${chatId}`);
};

// Leave a group chat
export const leaveGroupChat = (chatId) => {
  return apiClient.patch(`/api/chat/group/${chatId}/leave`);
};

export default apiClient;
