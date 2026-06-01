import { NextRequest, NextResponse } from "next/server";
import { posodobiStatus } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Manjka id ali status" }, { status: 400 });
    }
    await posodobiStatus(id, status);
    return NextResponse.json({ uspeh: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
