"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  ATTENDEE: "/dashboard/attendee",
  ORGANIZER: "/dashboard/organizer",
  INSTRUCTOR: "/dashboard/instructor",
  ADMIN: "/dashboard/attendee",
  SUPER_ADMIN: "/dashboard/admin",
};

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string | null;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Determine redirect based on role
  const role = data.user?.app_metadata?.role as string | undefined;
  const dashboardPath = role ? ROLE_DASHBOARD_MAP[role] || "/dashboard/attendee" : "/dashboard/attendee";

  redirect(redirectTo || dashboardPath);
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  // Validate role — users cannot self-assign ADMIN or SUPER_ADMIN
  const allowedRoles = ["ATTENDEE", "ORGANIZER", "INSTRUCTOR"];
  const selectedRole = allowedRoles.includes(role) ? role : "ATTENDEE";

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: selectedRole,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create the Prisma user record
  if (data.user) {
    try {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email,
          name,
          role: selectedRole as "ATTENDEE" | "ORGANIZER" | "INSTRUCTOR",
        },
      });
    } catch (e) {
      // User might already exist if they re-registered
      console.error("Prisma user creation error:", e);
    }
  }

  // If email confirmation is enabled in Supabase, show a message
  if (data.user && !data.session) {
    return { success: "Check your email to confirm your account!" };
  }

  // If auto-confirmed, redirect to dashboard
  const dashboardPath = ROLE_DASHBOARD_MAP[selectedRole] || "/dashboard/attendee";
  redirect(dashboardPath);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  // Get role from JWT app_metadata
  try {
    const payload = session.access_token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    const role = decoded?.app_metadata?.role as string | undefined;

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.name as string | undefined,
      role: role || "ATTENDEE",
    };
  } catch {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.name as string | undefined,
      role: "ATTENDEE",
    };
  }
}
