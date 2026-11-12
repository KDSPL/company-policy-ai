
import "@/app/globals.scss";
import Header from "@/app/components/Header/Header";
import SessionGuard from "@/app/components/SessionGuard/SessionGuard";
import AuthSessionProvider from "@/app/components/SessionProvider/SessionProvider";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id || session.invalidated) {
    redirect("/signin");
  }

  return (
    <AuthSessionProvider>
      <SessionGuard>
        <Header />
        <main>
          {children}
        </main>
      </SessionGuard>
    </AuthSessionProvider>
  );
}
