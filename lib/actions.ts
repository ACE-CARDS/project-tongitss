'use server';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signinWithGoogle() {
  const supabase = await createClient();

  const auth_callback_url = `${process.env.SITE_URL}/auth/callback`;

  const targetPath = '/dashboard';
  const redirectTo = `${auth_callback_url}?next=${encodeURIComponent(targetPath)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo,
    },
  });

  if (error) {
    console.error("OAuth Error:", error);
    return;
  }

  if (data.url) {
    redirect(data.url);
  }
}