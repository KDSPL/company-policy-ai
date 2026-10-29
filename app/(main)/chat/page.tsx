import ClientChat from "@/app/components/ClientChat/ClientChat";
import styles from "./page.module.scss";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className={styles.mainContent}>
      <ClientChat />
    </div>
  );
}