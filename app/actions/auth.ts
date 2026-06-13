"use server";

import { loginUser, registerUser, logout, getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password || !confirmPassword) {
    return { message: "Please fill in all fields" };
  }

  if (password !== confirmPassword) {
    return { message: "Passwords do not match" };
  }

  if (password.length < 8) {
    return { message: "Password must be at least 8 characters long" };
  }

  const result = await registerUser({ name, email, password });
  if (!result.success) {
    return { message: result.error || "Failed to register" };
  }

  revalidatePath("/");
  return { success: true, user: result.user };
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

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

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function updateProfileAction(name: string, image: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  await convex.mutation(api.users.updateUser, {
    id: user.id,
    name,
    image,
  });

  revalidatePath("/profile");
  return { success: true };
}
