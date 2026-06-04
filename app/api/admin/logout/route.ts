import { NextResponse } from "next/server";
import { pocistiSession } from "@/lib/auth";

export async function POST(req: Request) {
  await pocistiSession();
  return NextResponse.redirect(new URL("/admin/login", req.url), { status: 303 });
}
