import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== "enigmatic-i2v2i") {
    redirect(`/nodal/${slug}/dashboard`);
  }

  return <>{children}</>;
}
