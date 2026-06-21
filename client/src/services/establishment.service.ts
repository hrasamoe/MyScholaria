import { apiRequest } from "./api.service";

const API_URL = import.meta.env.VITE_API_URL;

export interface EstablishmentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    code: string;
    email: string;
    joinCode: string;
    adminCode: string;
  };
}

export async function createEstablishment(
  data: {
    name: string;
    code: string;
    type: string;
    address: string;
    phone: string;
    email: string;
    city: string;
    zipCode: string;
    identificationNumber?: string;
    joinCode: string;
    adminCode: string;
  },
  accessToken: string,
): Promise<EstablishmentResponse> {
  const res = await fetch(`${API_URL}/api/establishment/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
}

export async function getMyEstablishments(): Promise<any[]> {
  const res = await apiRequest(`/api/establishment/my`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result.data;
}

export async function approvedMember(email: string, establishmentId: string) {
  const res = await apiRequest(`/api/establishment/approve-member`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, establishmentId }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
}
