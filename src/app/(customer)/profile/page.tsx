"use client";

import Link from "next/link";
import { ClientOnly } from "@/components/ui/client-only";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { OrderHistoryList } from "@/components/orders/OrderHistoryList";
import { toast } from "sonner";
import { LogOut, User, MapPin, Package, Heart, Bell, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useWishlistStore } from "@/store/wishlistStore";
import { ProductCard } from "@/features/products/components/ProductCard";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotificationStore } from "@/store/notificationStore";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { profile, updateProfileData, addAddressData } = useAuthStore();
  const router = useRouter();
  const { items: wishlistItems } = useWishlistStore();
  const { notifications, markAsRead, markAllAsRead, getUnreadCount } = useNotificationStore();
  const [mounted, setMounted] = useState(false);

  // Profile Edit State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(profile?.name || "");
  const [editPhone, setEditPhone] = useState(profile?.phone || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address Add State
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    type: "home" as "home" | "office",
  });

  const [appConfig, setAppConfig] = useState<{ apkUrl?: string; apkVersion?: string; apkEnabled?: boolean } | null>(null);

  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("@/firebase/config");
        const docRef = doc(db, "settings", "appConfig");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAppConfig(docSnap.data() as any);
        } else {
          // Fallback if document doesn't exist
          setAppConfig({ apkEnabled: true, apkUrl: "#", apkVersion: "1.0.0" });
        }
      } catch (error) {
        console.error("Failed to fetch app config", error);
      }
    };
    fetchAppConfig();
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      setIsSavingProfile(true);
      await AuthService.updateUserProfile(profile.uid, { name: editName, phone: editPhone });
      updateProfileData({ name: editName, phone: editPhone });
      toast.success("Profile updated successfully!");
      setIsEditProfileOpen(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!profile) return;

    // Basic validation
    if (!newAddress.fullName || !newAddress.street || !newAddress.city || !newAddress.postalCode) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSavingAddress(true);
      await AuthService.addAddress(profile.uid, newAddress);
      addAddressData(newAddress);
      toast.success("Address added successfully!");
      setIsAddAddressOpen(false);
      setNewAddress({ fullName: "", phone: "", street: "", city: "", state: "", postalCode: "", type: "home" });
    } catch (error) {
      toast.error("Failed to add address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  if (!profile) return null;

  return (
    <ClientOnly>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
            <p className="text-muted-foreground mt-2">Manage your profile, orders, and addresses.</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1 bg-muted/50">
            <TabsTrigger value="profile" className="py-2.5">
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="py-2.5">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="py-2.5">
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="py-2.5">
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="py-2.5 relative">
              <Bell className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
              {getUnreadCount() > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {getUnreadCount()}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="font-medium">{profile.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{profile.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                    <DialogTrigger className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
                      Edit Profile
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Make changes to your personal information here. Click save when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>
                      <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                        {isSavingProfile ? "Saving..." : "Save changes"}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* New Section 6: Customer Support Shortcuts */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>Get in touch with our customer support team.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm"><strong>Support Name:</strong> Ammar Shaikh</p>
                  <p className="text-sm"><strong>Support Number:</strong> 7801986978</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" asChild>
                    <a href="tel:7801986978">Call Support</a>
                  </Button>
                  <Button variant="default" asChild>
                    <Link href="/contact">Create Support Ticket</Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href="/profile?tab=tickets">View Existing Tickets</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* New Section 5: Download App */}
            {appConfig?.apkEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle>Download Mobile App</CardTitle>
                  <CardDescription>Install the TechyMart app for faster access.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button variant="default" asChild>
                      <a href={appConfig.apkUrl} target="_blank" rel="noopener noreferrer">
                        Download Android APK {appConfig.apkVersion && `(v${appConfig.apkVersion})`}
                      </a>
                    </Button>
                    <Button variant="outline" onClick={() => toast.info("Installation instructions coming soon!")}>
                      Installation Instructions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          </TabsContent>

          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>Manage your delivery addresses.</CardDescription>
              </CardHeader>
              <CardContent>
                {profile.addresses?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No addresses saved yet.</p>
                    <Dialog open={isAddAddressOpen} onOpenChange={setIsAddAddressOpen}>
                      <DialogTrigger className={cn(buttonVariants({ variant: "default" }), "mt-4")}>
                        Add New Address
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                          <DialogDescription>Enter your delivery details below.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Full Name *</Label>
                              <Input
                                value={newAddress.fullName}
                                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                placeholder="John Doe"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Phone Number</Label>
                              <Input
                                value={newAddress.phone}
                                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                placeholder="+1 234 567 890"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Street Address *</Label>
                            <Input
                              value={newAddress.street}
                              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                              placeholder="123 Main St, Apt 4B"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2 col-span-2">
                              <Label>City *</Label>
                              <Input
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                placeholder="New York"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>State/Province</Label>
                              <Input
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                placeholder="NY"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>ZIP / Postal Code *</Label>
                              <Input
                                value={newAddress.postalCode}
                                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                placeholder="10001"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Address Type</Label>
                              <div className="flex gap-2 mt-1">
                                <Button
                                  type="button"
                                  variant={newAddress.type === "home" ? "default" : "outline"}
                                  className="w-full text-xs"
                                  onClick={() => setNewAddress({ ...newAddress, type: "home" })}
                                >
                                  Home
                                </Button>
                                <Button
                                  type="button"
                                  variant={newAddress.type === "office" ? "default" : "outline"}
                                  className="w-full text-xs"
                                  onClick={() => setNewAddress({ ...newAddress, type: "office" })}
                                >
                                  Office
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button onClick={handleSaveAddress} disabled={isSavingAddress} className="w-full">
                          {isSavingAddress ? "Saving..." : "Save Address"}
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.addresses?.map((address, i) => (
                      <div key={i} className="p-4 border rounded-xl bg-card">
                        <p className="font-semibold">{address.fullName}</p>
                        <p className="text-sm mt-1">{address.street}, {address.city}, {address.state} {address.postalCode}</p>
                        <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>
                      </div>
                    ))}
                    <Dialog open={isAddAddressOpen} onOpenChange={setIsAddAddressOpen}>
                      <DialogTrigger className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
                        Add New Address
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                          <DialogDescription>Enter your delivery details below.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Full Name *</Label>
                              <Input
                                value={newAddress.fullName}
                                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                placeholder="John Doe"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Phone Number</Label>
                              <Input
                                value={newAddress.phone}
                                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                placeholder="+1 234 567 890"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Street Address *</Label>
                            <Input
                              value={newAddress.street}
                              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                              placeholder="123 Main St, Apt 4B"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2 col-span-2">
                              <Label>City *</Label>
                              <Input
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                placeholder="New York"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>State/Province</Label>
                              <Input
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                placeholder="NY"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>ZIP / Postal Code *</Label>
                              <Input
                                value={newAddress.postalCode}
                                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                placeholder="10001"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Address Type</Label>
                              <div className="flex gap-2 mt-1">
                                <Button
                                  type="button"
                                  variant={newAddress.type === "home" ? "default" : "outline"}
                                  className="w-full text-xs"
                                  onClick={() => setNewAddress({ ...newAddress, type: "home" })}
                                >
                                  Home
                                </Button>
                                <Button
                                  type="button"
                                  variant={newAddress.type === "office" ? "default" : "outline"}
                                  className="w-full text-xs"
                                  onClick={() => setNewAddress({ ...newAddress, type: "office" })}
                                >
                                  Office
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button onClick={handleSaveAddress} disabled={isSavingAddress} className="w-full">
                          {isSavingAddress ? "Saving..." : "Save Address"}
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
                <p className="text-muted-foreground mt-1">Track, return, or buy items again.</p>
              </div>
              <OrderHistoryList />
            </div>
          </TabsContent>

          <TabsContent value="wishlist">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">My Wishlist</h2>
                <p className="text-muted-foreground mt-1">Products you have saved for later.</p>
              </div>

              {wishlistItems.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12 text-muted-foreground">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Your wishlist is empty.</p>
                    <Button className="mt-4" onClick={() => router.push("/products")}>Browse Products</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {wishlistItems.map((product) => (
                    <ProductCard key={product.id} product={product as any} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Updates about your orders and promotions.</CardDescription>
                </div>
                {getUnreadCount() > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
                    Mark all as read
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>You have no new notifications.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border rounded-xl flex gap-4 transition-colors cursor-pointer hover:bg-muted/50 ${!notif.read ? "bg-primary/5 border-primary/20" : "bg-card"}`}
                        onClick={() => !notif.read && markAsRead(notif.id)}
                      >
                        <div className="mt-1">
                          {notif.type === "promo" ? (
                            <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                              <Star className="w-4 h-4" />
                            </div>
                          ) : notif.type === "order" ? (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                              <Package className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                              <Bell className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-medium ${!notif.read ? "text-foreground" : "text-foreground/80"}`}>
                              {notif.title}
                            </h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                              {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className={`text-sm ${!notif.read ? "text-foreground/90" : "text-muted-foreground"}`}>
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClientOnly>
  );
}
