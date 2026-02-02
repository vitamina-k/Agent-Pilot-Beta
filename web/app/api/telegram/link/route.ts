import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateLinkCode } from "@/lib/utils";

// Generate a linking code for web user
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Get user
    const { data: user, error: userError } = await supabase
      .from("usuarios_pro")
      .select("id, telegram_user_id")
      .eq("Correo_Electronico", email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.telegram_user_id) {
      return NextResponse.json(
        { error: "Already linked to Telegram", telegram_id: user.telegram_user_id },
        { status: 400 }
      );
    }

    // Generate new linking code
    const code = generateLinkCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save code
    const { error: updateError } = await supabase
      .from("usuarios_pro")
      .update({
        codigo_vinculacion: code,
        codigo_vinculacion_expira: expiresAt.toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      code,
      expires_at: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("Error generating link code:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Verify and link Telegram account (called by bot)
export async function PUT(req: Request) {
  try {
    const { code, telegram_user_id, bot_secret } = await req.json();

    // Verify bot secret
    if (bot_secret !== process.env.BOT_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!code || !telegram_user_id) {
      return NextResponse.json(
        { error: "Code and telegram_user_id are required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Find user by code
    const { data: user, error: userError } = await supabase
      .from("usuarios_pro")
      .select("id, codigo_vinculacion_expira")
      .eq("codigo_vinculacion", code)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    // Check expiration
    if (
      user.codigo_vinculacion_expira &&
      new Date(user.codigo_vinculacion_expira) < new Date()
    ) {
      return NextResponse.json(
        { error: "Code has expired" },
        { status: 400 }
      );
    }

    // Check if telegram_user_id is already linked
    const { data: existingLink } = await supabase
      .from("usuarios_pro")
      .select("id")
      .eq("telegram_user_id", telegram_user_id)
      .single();

    if (existingLink && existingLink.id !== user.id) {
      return NextResponse.json(
        { error: "Telegram account already linked to another user" },
        { status: 400 }
      );
    }

    // Link accounts
    const { error: updateError } = await supabase
      .from("usuarios_pro")
      .update({
        telegram_user_id,
        codigo_vinculacion: null,
        codigo_vinculacion_expira: null,
      })
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Accounts linked successfully",
    });
  } catch (err) {
    console.error("Error linking accounts:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
