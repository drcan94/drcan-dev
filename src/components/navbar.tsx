"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  FileText,
  User,
  LayoutDashboard,
  FilePlus,
  FileEdit,
  Files,
} from "lucide-react";
import { useSession } from "next-auth/react";

import { cn } from "@/lib/utils";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const navigation = [
  { name: "Blog", href: "/blog", icon: FileText },
  { name: "Hakkımda", href: "/about", icon: User },
];

const adminNavigation = [
  { name: "Admin", href: "/admin", icon: LayoutDashboard },
  { name: "Yeni Yazı", href: "/admin/posts/new", icon: FilePlus },
  { name: "Taslaklar", href: "/admin/posts/drafts", icon: FileEdit },
  { name: "Tüm Yazılar", href: "/admin/posts", icon: Files },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center px-4">
        <div className="flex flex-1 items-center justify-between gap-8">
          <Link href="/" className="text-xl font-bold">
            DrCan.dev
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
            {session?.user.isAdmin &&
              adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            <ModeToggle />

            {/* Mobile menu button */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs lg:hidden">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-left">
                    <Link
                      href="/"
                      onClick={() => setOpen(false)}
                      className="text-xl font-bold"
                    >
                      DrCan.dev
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:text-primary",
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                  {session?.user.isAdmin &&
                    adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:text-primary",
                          pathname === item.href
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
