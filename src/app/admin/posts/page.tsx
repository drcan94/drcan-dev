import { type Metadata } from "next";
import { AdminPostsPage } from "./_components/admin-posts-page";

export const metadata: Metadata = {
  title: "Blog Yazıları Yönetimi",
  description: "Blog yazılarını yönetin, düzenleyin ve silin.",
};

export default function Page() {
  return <AdminPostsPage />;
}
