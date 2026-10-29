import styles from "./page.module.scss";
import RecentChats from "@/app/components/RecentChats/RecentChats"; 
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function chatHistoryPage() {

  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className={styles.mainContent}>
      <RecentChats />
    </div>
  );
}