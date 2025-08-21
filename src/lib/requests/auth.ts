import client from "../client";
import { User, UserProfile } from "../models/User";

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const endpoint = "/v1/auth/login";

  return (await client.post<AuthResponse>(endpoint, { email, password })).data;
}

export async function refreshToken(
  refreshTokenValue: string
): Promise<AuthResponse> {
  const endpoint = "/v1/auth/refresh";

  return (await client.post<AuthResponse>(endpoint, refreshTokenValue)).data;
}

export async function logout(refreshTokenValue: string): Promise<void> {
  // Note: Current backend doesn't implement logout, so we'll just clear local storage
  // const endpoint = "/v1/auth/logout"
  // await client.post(endpoint, { refreshToken: refreshTokenValue })

  // Clear local storage
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessTokenExpiry");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
}

export async function verifyToken(): Promise<{ isValid: boolean }> {
  const endpoint = "/v1/auth/validate";

  return (await client.post(endpoint)).data;
}

// Note: The following functions are not yet implemented in the current backend
// They can be added back when the backend supports them

export async function sendVerification(email: string) {
  throw new Error("Email verification not implemented in current backend");
}

export async function confirmEmail(email: string, token: string) {
  throw new Error("Email confirmation not implemented in current backend");
}

export async function isEmailVerified(email: string) {
  throw new Error(
    "Email verification check not implemented in current backend"
  );
}

export async function forgotPassword(email: string) {
  throw new Error("Password reset not implemented in current backend");
}

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string
) {
  throw new Error("Password reset not implemented in current backend");
}

export async function getCurrentUserProfile(): Promise<
  UserProfile | undefined
> {
  const endpoint = `/v1/profiles/me`;

  const request = client.get<UserProfile>(endpoint);

  return await request
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        return null; // User is not authenticated
      } else {
        console.error("Error fetching user profile:", error);
      }
    })
    .then((response) => {
      return response?.data;
    });
}

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<AuthResponse> {
  const endpoint = "/v1/auth/register";

  return (
    await client.post<AuthResponse>(endpoint, {
      email,
      password,
      firstName,
      lastName,
    })
  ).data;
}
