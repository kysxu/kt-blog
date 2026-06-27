import axios from "axios";
import { blogPosts as defaultBlogPosts } from "../data/blogPosts";

const API_BASE_URL = "https://blog-post-project-api-with-db.vercel.app";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Initialize localStorage fallback data if not present
const initLocalStorage = () => {
  if (!localStorage.getItem("fallback_posts")) {
    localStorage.setItem("fallback_posts", JSON.stringify(defaultBlogPosts));
  }
  if (!localStorage.getItem("fallback_categories")) {
    localStorage.setItem("fallback_categories", JSON.stringify(["Highlight", "Cat", "Inspiration", "General"]));
  }
  if (!localStorage.getItem("fallback_users")) {
    localStorage.setItem("fallback_users", JSON.stringify([]));
  }
};

initLocalStorage();

// Helper to get local data
const getLocalPosts = () => JSON.parse(localStorage.getItem("fallback_posts"));
const setLocalPosts = (posts) => localStorage.setItem("fallback_posts", JSON.stringify(posts));
const getLocalCategories = () => JSON.parse(localStorage.getItem("fallback_categories"));
const setLocalCategories = (cats) => localStorage.setItem("fallback_categories", JSON.stringify(cats));
const getLocalUsers = () => JSON.parse(localStorage.getItem("fallback_users"));
const setLocalUsers = (users) => localStorage.setItem("fallback_users", JSON.stringify(users));

export const api = {
  // --- CATEGORIES ---
  async fetchCategories() {
    try {
      const response = await apiClient.get("/categories");
      // Ensure it's in string list format or convert if it's an array of objects
      const data = response.data;
      if (Array.isArray(data)) {
        return data.map(c => typeof c === "string" ? c : (c.name || c.title));
      }
      return data;
    } catch (error) {
      console.warn("API categories call failed, using localStorage fallback:", error.message);
      return getLocalCategories();
    }
  },

  async createCategory(categoryName) {
    try {
      const response = await apiClient.post("/categories", { name: categoryName });
      return response.data;
    } catch (error) {
      console.warn("API createCategory failed, using localStorage fallback:", error.message);
      const cats = getLocalCategories();
      if (!cats.includes(categoryName)) {
        cats.push(categoryName);
        setLocalCategories(cats);
      }
      return { name: categoryName };
    }
  },

  async deleteCategory(categoryName) {
    try {
      await apiClient.delete(`/categories/${categoryName}`);
      return true;
    } catch (error) {
      console.warn("API deleteCategory failed, using localStorage fallback:", error.message);
      const cats = getLocalCategories();
      const updated = cats.filter(c => c !== categoryName);
      setLocalCategories(updated);
      return true;
    }
  },

  // --- POSTS ---
  async fetchPosts({ category, page = 1, limit = 6, keyword = "" } = {}) {
    try {
      // Build query params
      const params = {};
      // If category is "Highlight", we show all posts (no filter)
      if (category && category !== "Highlight") {
        params.category = category;
      }
      if (page) params.page = page;
      if (limit) params.limit = limit;
      if (keyword) params.keyword = keyword;

      const response = await apiClient.get("/posts", { params });
      return response.data;
    } catch (error) {
      console.warn("API fetchPosts failed, using localStorage fallback:", error.message);
      
      let posts = getLocalPosts();

      // Filter by category (case-insensitive)
      if (category && category !== "Highlight") {
        posts = posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }

      // Filter by keyword (title, description, content)
      if (keyword) {
        const query = keyword.toLowerCase();
        posts = posts.filter(p => 
          (p.title && p.title.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.content && p.content.toLowerCase().includes(query))
        );
      }

      const totalPosts = posts.length;
      const totalPages = Math.ceil(totalPosts / limit);
      const slicedPosts = posts.slice((page - 1) * limit, page * limit);

      return {
        posts: slicedPosts,
        totalPages,
        totalPosts,
        currentPage: page
      };
    }
  },

  async fetchPostById(id) {
    try {
      const response = await apiClient.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`API fetchPostById(${id}) failed, using localStorage fallback:`, error.message);
      const posts = getLocalPosts();
      const post = posts.find(p => String(p.id) === String(id));
      if (!post) throw new Error("Post not found");
      return post;
    }
  },

  // --- AUTHENTICATION ---
  async register({ email, password, username }) {
    try {
      const response = await apiClient.post("/auth/register", { email, password, username });
      return response.data;
    } catch (error) {
      console.warn("API register failed, using localStorage fallback:", error.message);
      const users = getLocalUsers();
      if (users.some(u => u.email === email)) {
        throw new Error("Email already registered");
      }
      const newUser = { email, password, username, avatar: null };
      users.push(newUser);
      setLocalUsers(users);
      return { message: "Registration successful" };
    }
  },

  async login({ email, password }) {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const data = response.data;
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      return data;
    } catch (error) {
      console.warn("API login failed, using localStorage fallback:", error.message);
      const users = getLocalUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        throw new Error("Invalid email or password");
      }
      const token = `mock-token-${Date.now()}`;
      localStorage.setItem("token", token);
      localStorage.setItem("mock_current_user", JSON.stringify(user));
      return { token, user };
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get("/auth/get-user");
      return response.data;
    } catch (error) {
      console.warn("API getCurrentUser failed, using localStorage fallback:", error.message);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const user = JSON.parse(localStorage.getItem("mock_current_user"));
      if (!user) throw new Error("User session not found");
      return user;
    }
  },

  async resetPassword({ oldPassword, newPassword }) {
    try {
      const response = await apiClient.post("/auth/reset-password", { oldPassword, newPassword });
      return response.data;
    } catch (error) {
      console.warn("API resetPassword failed, using localStorage fallback:", error.message);
      const user = JSON.parse(localStorage.getItem("mock_current_user"));
      if (!user) throw new Error("User session not found");
      if (user.password !== oldPassword) {
        throw new Error("Old password is incorrect");
      }
      
      // Update in users database
      const users = getLocalUsers();
      const userIdx = users.findIndex(u => u.email === user.email);
      if (userIdx !== -1) {
        users[userIdx].password = newPassword;
        setLocalUsers(users);
      }
      
      user.password = newPassword;
      localStorage.setItem("mock_current_user", JSON.stringify(user));
      return { message: "Password reset successful" };
    }
  },

  // --- USER PROFILE ---
  async updateProfile({ username, avatar }) {
    try {
      const response = await apiClient.put("/profile", { username, avatar });
      return response.data;
    } catch (error) {
      console.warn("API updateProfile failed, using localStorage fallback:", error.message);
      const user = JSON.parse(localStorage.getItem("mock_current_user"));
      if (!user) throw new Error("User session not found");
      
      // Update in users database
      const users = getLocalUsers();
      const userIdx = users.findIndex(u => u.email === user.email);
      if (userIdx !== -1) {
        users[userIdx].username = username;
        users[userIdx].avatar = avatar;
        setLocalUsers(users);
      }
      
      user.username = username;
      user.avatar = avatar;
      localStorage.setItem("mock_current_user", JSON.stringify(user));
      return user;
    }
  },

  // --- ADMIN POSTS ---
  async fetchAdminPosts() {
    try {
      const response = await apiClient.get("/posts/admin");
      return response.data;
    } catch (error) {
      console.warn("API fetchAdminPosts failed, using localStorage fallback:", error.message);
      return getLocalPosts(); // Return all posts including drafts
    }
  },

  async createAdminPost(postData) {
    try {
      const response = await apiClient.post("/posts/admin", postData);
      return response.data;
    } catch (error) {
      console.warn("API createAdminPost failed, using localStorage fallback:", error.message);
      const posts = getLocalPosts();
      const newPost = {
        ...postData,
        id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
        likes: 0,
        author: postData.author || "Admin",
        date: postData.date || new Date().toISOString()
      };
      posts.unshift(newPost); // Add to beginning
      setLocalPosts(posts);
      return newPost;
    }
  },

  async updateAdminPost(postId, postData) {
    try {
      const response = await apiClient.put(`/posts/admin/${postId}`, postData);
      return response.data;
    } catch (error) {
      console.warn(`API updateAdminPost(${postId}) failed, using localStorage fallback:`, error.message);
      const posts = getLocalPosts();
      const idx = posts.findIndex(p => String(p.id) === String(postId));
      if (idx === -1) throw new Error("Post not found");
      
      const updatedPost = {
        ...posts[idx],
        ...postData
      };
      posts[idx] = updatedPost;
      setLocalPosts(posts);
      return updatedPost;
    }
  },

  async deleteAdminPost(postId) {
    try {
      await apiClient.delete(`/posts/admin/${postId}`);
      return true;
    } catch (error) {
      console.warn(`API deleteAdminPost(${postId}) failed, using localStorage fallback:`, error.message);
      const posts = getLocalPosts();
      const updated = posts.filter(p => String(p.id) !== String(postId));
      setLocalPosts(updated);
      return true;
    }
  }
};
