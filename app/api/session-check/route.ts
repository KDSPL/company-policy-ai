import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.invalidated === true) {
      return NextResponse.json(
        { valid: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { valid: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session check failed:", error);

    return NextResponse.json(
      { valid: false },
      { status: 500 }
    );
  }
}