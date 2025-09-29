import Header from "@/app/(protect)/dashboard/components/header/Header";
import Main from "@/app/(protect)/dashboard/components/main/page";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";
import { redirect } from "next/navigation";

// Evita cache: garante execução no servidor e dados atualizados
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return (
    <main>
      <Header />
      <Main />
    </main>
  );
}
