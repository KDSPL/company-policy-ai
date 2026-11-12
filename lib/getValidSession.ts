
import { auth } from "@/auth";

export async function getValidSession() {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.invalidated
  ) {
    return null;
  }

  return session;
}
