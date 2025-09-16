import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json({ echo: parsed.data.message }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}



