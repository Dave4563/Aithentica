import axiosInstance from "./axiosConfig";

interface LoginData {
  username: string;
  password: string;
}

interface LoginResponse {
  access: string;
  user: {
    username: string;
    email: string;
  };
}

export const login = async ({ username, password }: LoginData): Promise<LoginResponse> => {
  try {
    const { data } = await axiosInstance.post<LoginResponse>("/auth/login/", {
      username,
      password,
    }, { withCredentials: true });
    return data;
  } catch (err: any) {
    // Optional: you can normalize backend errors here
    throw err.response?.data || { detail: "Login failed" };
  }
};

export const register = (data: {
  username: string;
  email: string;
  password: string;
  password2: string;
}) => axiosInstance.post("/auth/registration/", data);

export const getUser = async () => {
  const { data } = await axiosInstance.get("/auth/user/");
  return data;
};

interface RefreshResponse {
  access: string;
  refresh: string;
}


/**
 * Refresh access token using HttpOnly cookie (backend reads refreshToken automatically).
 * @returns New access token (and optionally new refresh token)
 */
export const refreshAccessToken = async (): Promise<RefreshResponse> => {
  try {
    const { data } = await axiosInstance.post<RefreshResponse>(
      "/auth/token/refresh/",
      {},
      { withCredentials: true } // 🔑 cookie is sent automatically
    );
    return data;
  } catch (err: any) {
    throw err.response?.data || { detail: "Failed to refresh token" };
  }
};
