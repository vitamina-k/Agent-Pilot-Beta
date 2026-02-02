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
        const emailLower = user.email.toLowerCase();

        // Check if user profile exists (case-insensitive)
        const { data: profile } = await supabase
          .from("usuarios_pro")
          .select("id, Correo_Electronico")
          .ilike("Correo_Electronico", emailLower)
          .single();

        if (!profile) {
          // Create user profile with welcome credits
          await supabase.from("usuarios_pro").insert({
            Correo_Electronico: emailLower,
            creditos_disponibles: 50,
            plan_actual: "free",
            estado: "activo",
            bio_entrenamiento: {},
          });
        } else if (profile.Correo_Electronico !== emailLower) {
          // Update email to match auth email (normalize case)
          await supabase
            .from("usuarios_pro")
            .update({ Correo_Electronico: emailLower })
            .eq("id", profile.id);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
