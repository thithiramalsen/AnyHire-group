import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,

	signup: async (formData) => {
        set({ loading: true });

        try {
            // Send FormData to the backend
            const res = await axios.post("/auth/signup", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            set({ user: res.data, loading: false });
            toast.success("Signup successful!");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An error occurred during signup");
        }
    },
	
	login: async (email, password) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password });
			console.debug('[UserStore] Login response:', res.data);
			
			// Ensure we have the access token
			if (!res.data.accessToken) {
				console.error('[UserStore] No access token in login response');
				throw new Error('No access token received');
			}

			// Store the user data with the access token
			set({ 
				user: {
					...res.data,
					accessToken: res.data.accessToken
				}, 
				loading: false 
			});
			
			console.debug('[UserStore] User state after login:', useUserStore.getState().user);
			toast.success("Login successful!");
			window.location.href = "/jobs"; // Redirect to jobs page after successful login
		} catch (error) {
			set({ loading: false });
			console.error("[UserStore] Login error:", error.response?.data || error.message);
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},

	logout: async () => {
		try {
			await axios.post("/auth/logout");
			set({ user: null });
			toast.success("Logged out successfully!");
			window.location.href = "/"; // Redirect to homepage after successful logout
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},

	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/auth/profile");
			console.debug('[UserStore] Profile response:', response.data);
			
			// Get a fresh access token
			const tokenResponse = await axios.post("/auth/refresh-token");
			console.debug('[UserStore] Token refresh response:', tokenResponse.data);
			
			if (!tokenResponse.data.accessToken) {
				throw new Error('No access token received from refresh');
			}

			// Store the user data with the fresh access token
			set({ 
				user: {
					...response.data,
					accessToken: tokenResponse.data.accessToken
				}, 
				checkingAuth: false 
			});
			
			console.debug('[UserStore] User state after auth check:', useUserStore.getState().user);
		} catch (error) {
			console.error('[UserStore] Auth check error:', error.message);
			set({ checkingAuth: false, user: null });
		}
	},

	refreshToken: async () => {
		// Prevent multiple simultaneous refresh attempts
		if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
			// Update the user object with the new access token
			set(state => ({
				user: state.user ? { ...state.user, accessToken: response.data.accessToken } : null,
				checkingAuth: false
			}));
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},
}));

// TODO: Implement the axios interceptors for refreshing access token

// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// If a refresh is already in progress, wait for it to complete
				if (refreshPromise) {
					await refreshPromise;
					return axios(originalRequest);
				}

				// Start a new refresh process
				refreshPromise = useUserStore.getState().refreshToken();
				await refreshPromise;
				refreshPromise = null;

				return axios(originalRequest);
			} catch (refreshError) {
				// If refresh fails, redirect to login or handle as needed
				useUserStore.getState().logout();
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);