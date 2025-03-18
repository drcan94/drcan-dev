import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Arama - DrCan.dev",
  description:
    "DrCan.dev Blog içeriklerinde arama yapın. Sağlık ve yazılım konularında aradığınız içerikleri bulun.",
  keywords: ["blog arama", "arama", "içerik arama", "Dr. Burak Can"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Blog Arama - DrCan.dev",
    description: "İçeriklerde arama yapın ve ilgilendiğiniz konuları bulun",
    type: "website",
    url: "https://drcan.dev/blog/search",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
