
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // 1. Get the current authenticated session
    const session = await auth();

    // 2. Reject unauthenticated or already invalidated sessions
    if (
      !session?.user?.id ||
      session.invalidated === true
    ) {
      return NextResponse.json(
        { message: "Unauthorized. Please sign in again." },
        { status: 401 }
      );
    }

    // 3. Increment sessionVersion to invalidate all existing JWTs
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        sessionVersion: {
          increment: 1,
        },
      },
      select: {
        sessionVersion: true,
      },
    });

    // 4. Log successful invalidation (development only)
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Global logout successful. New session version:",
        updatedUser.sessionVersion
      );
    }

    // 5. Return success
    return NextResponse.json(
      { message: "All sessions invalidated successfully." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Global logout failed:", error);

    return NextResponse.json(
      { message: "Unable to invalidate all sessions." },
      { status: 500 }
    );
  }
}
