// app/api/tasks/route.ts
import { NextResponse } from "next/server";
import { dummyTasks } from "@/app/(data)/dummy";

export async function GET() {
  // 将来ここが Prisma の呼び出しに差し替わる想定
  return NextResponse.json(dummyTasks);
}
