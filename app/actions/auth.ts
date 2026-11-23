"use server";

import { loginUser, registerUser, logout, getSessionUser, requireSessionToken } from "@/lib/auth";
import { convex } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { revalidatePath } from "next/cache";

export async function registerAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (!name || !email || !password || !confirmPassword) {
    return { message: "Please fill in all fields" };
  }

  if (password !== confirmPassword) {
    return { message: "Passwords do not match" };
  }

  const result = await registerUser({ name, email, password });
  if (!result.success) {
    return { message: result.error || "Failed to register" };
  }

  revalidatePath("/");
  return { success: true, user: result.user };
}

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { message: "Please fill in all fields" };
  }

  const result = await loginUser({ email, password });
  if (!result.success) {
    return { message: result.error || "Invalid email or password" };
  }

  revalidatePath("/");
  return { success: true, user: result.user };
}

export async function logoutAction() {
  await logout();
  revalidatePath("/");
}

export async function getCurrentUserAction() {
  return await getSessionUser();
}

export async function updateProfileAction(name: string, image: string) {
  const sessionToken = await requireSessionToken();

  if (typeof name !== "string" || typeof image !== "string") {
    throw new Error("Invalid profile data");
  }

  await convex.mutation(api.users.updateProfile, { sessionToken, name, image });

  revalidatePath("/profile");
  return { success: true };
}
