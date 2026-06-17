"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, LogOut, LayoutDashboard, Settings, ShoppingCart, Heart } from "lucide-react";

import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/layout/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((state) => state.items.reduce((count, item) => count + item.quantity, 0));
  const { user, profile } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      useAuthStore.getState().logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tighter text-primary">
                TechyMart
              </span>
            </Link>

            <nav className="hidden md:flex gap-6">
              <Link
                href="/products"
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/products" ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                All Products
              </Link>
              <Link
                href="/products?category=Electronics"
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname.includes("Electronics") ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                Electronics
              </Link>
              <Link
                href="/products?category=Fashion"
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname.includes("Fashion") ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                Fashion
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <form onSubmit={handleSearch} className="hidden md:flex relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full bg-background pl-8 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="flex items-center gap-1 md:gap-2">
              {mounted && user && <NotificationBell />}

              {mounted && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <User className="h-5 w-5 text-slate-600" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.name || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {profile?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {profile?.role === "admin" && (
                      <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard")}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/profile")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>My Account</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/orders")}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/wishlist")}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Wishlist</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              )}

              <Button variant="ghost" size="icon" asChild className="relative">
                <Link href="/cart">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="sr-only">Cart</span>
                  {mounted && cartCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
