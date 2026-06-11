import { apiRequest } from "./api.service";

const API_URL = import.meta.env.VITE_API_URL;

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    roles: string[];
  };
}

export async function register(
  email: string,
  password: string,
  full_name: string,
  first_name: string,
  last_name: string,
  role: string = "admin",
  schoolName: string,
): Promise<AuthResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name,
        role,
        schoolName,
        first_name,
        last_name,
      }),
      signal: controller.signal,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function logout(): Promise<void> {
  const res = await apiRequest(`/api/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  localStorage.removeItem("user");
  if (!res.ok && res.status !== 401) {
    const data = await res.json();
    throw new Error(data.message);
  }
}

export async function getMe(): Promise<AuthResponse> {
  let res = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!refreshRes.ok) {
      throw new Error("Session expirée");
    }

    res = await fetch(`${API_URL}/api/auth/me`, {
      credentials: "include",
    });
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function forgotpassword(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function registerMember(
  email: string,
  password: string,
  joinCode: string,
  full_name: string,
  last_name: string,
  first_name: string,
  role: string = "student",
  schoolID: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register-member`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      joinCode,
      full_name,
      last_name,
      first_name,
      role,
      schoolID,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}
