
"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SessionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  // Handle same-browser logout
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  // Handle logout from another browser
  useEffect(() => {
    if (status !== "authenticated") return;

    let isChecking = false;

    const checkSession = async () => {
      if (isChecking) return;

      isChecking = true;

      try {
        const response = await fetch("/api/session-check", {
          method: "GET",
          cache: "no-store",
        });

        if (response.status === 401) {
          await signOut({ redirect: false });
          router.replace("/signin");
        } else if (!response.ok) {
          console.error("Unable to verify session");
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        isChecking = false;
      }
    };

    const interval = setInterval(checkSession, 5000);

    return () => clearInterval(interval);
  }, [status]);

  if (status !== "authenticated") return null;

  return <>{children}</>;
}
