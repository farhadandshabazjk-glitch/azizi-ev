import AdminApp from "@/components/AdminApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Stock desk — Azizi EV",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
