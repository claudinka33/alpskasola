import { NextResponse } from "next/server";
import { pocistiSession } from "@/lib/auth";

export async function POST() {
  await pocistiSession();
  return NextResponse.json({ uspeh: true });
}
