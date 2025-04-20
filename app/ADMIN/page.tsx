// app/ADMIN/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard"; // asegúrate de que esté en la misma carpeta

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // No logueado
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // No es admin
  if (!session.user.isAdmin) {
    redirect("/Dashboard");
  }

  return <AdminDashboard />;
}
