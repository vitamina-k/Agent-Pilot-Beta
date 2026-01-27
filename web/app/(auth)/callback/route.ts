import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        // Check if user profile exists
        const { data: profile } = await supabase
          .from("usuarios_pro")
          .select("id")
          .eq("email", user.email)
          .single();

        if (!profile) {
          // Create user profile with welcome credits
          await supabase.from("usuarios_pro").insert({
            email: user.email,
            creditos_disponibles: 50,
            plan_actual: "free",
            estado: "activo",
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
