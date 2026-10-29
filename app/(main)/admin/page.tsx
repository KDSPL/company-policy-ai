import React from "react";
import Documents from "@/app/components/Documents/Documents";
import styles from "./page.module.scss";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.role !== "HR_ADMIN") {
    redirect("/chat");
  }

  return (
    <div className={styles.mainContent}>
      <Documents />
    </div>
  );
}