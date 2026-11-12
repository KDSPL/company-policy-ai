"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutSync() {
  useEffect(() => {
    const channel = new BroadcastChannel("auth-channel");

    channel.onmessage = (event) => {
      if (event.data === "logout") {
        signOut({
          redirectTo: "/signin",
        });
      }
    };

    return () => channel.close();
  }, []);

  return null;
}