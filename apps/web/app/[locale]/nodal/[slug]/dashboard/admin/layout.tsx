import { redirect } from "next/navigation";

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  if (params.slug !== "enigmatic-i2v2i") {
    redirect(`/nodal/${params.slug}/dashboard`);
  }

  return <>{children}</>;
}
