import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio CMS",
  description: "Admin dashboard for portfolio content management",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}