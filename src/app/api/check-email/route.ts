import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withApiProtection } from "@/lib/api-security";
import { supabaseAdmin } from "@/lib/supabase/admin";

const emailSchema = z.object({
  email: z.string().email("Email invalide"),
});

async function checkEmail(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = emailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: "Email invalide", available: false }, { status: 400 });
    }

    const { email } = validationResult.data;
    const admin = supabaseAdmin();

    // Vérifier si l'email existe déjà
    const { data: users } = await admin.auth.admin.listUsers();
    const emailExists = users.users.some((user) => user.email === email);

    return NextResponse.json({
      available: !emailExists,
      email,
    });
  } catch (error) {
    console.error("Erreur vérification email:", error);
    return NextResponse.json({ error: "Erreur serveur", available: false }, { status: 500 });
  }
}

export const POST = withApiProtection(checkEmail);
