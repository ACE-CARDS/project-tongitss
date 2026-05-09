'use server';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signinWithGoogle() {
  const supabase = await createClient();

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const origin = `${protocol}://${host}`; 

  const targetPath = '/dashboard';
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(targetPath)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo,
    },
  });

  if (error) {
    console.error("OAuth Error:", error);
    return redirect('/auth/auth-code-error');
  }

  if (data.url) {
    redirect(data.url);
  }
}