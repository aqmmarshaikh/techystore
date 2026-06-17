"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle, Shield, Key, Mail, History } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";

export default function AdminProfilePage() {
  const { user } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile updated successfully");
    }, 1000);
  };

  const handlePasswordReset = () => {
    toast.info("Password reset email sent to " + (user?.email || "your email"));
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and security preferences.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow flex items-center justify-center mb-4">
                <UserCircle className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold">{user?.email?.split('@')[0] || 'System Admin'}</h3>
              <p className="text-sm text-muted-foreground mb-4">{user?.email || 'admin@store.com'}</p>
              <Badge className="bg-primary hover:bg-primary">Super Admin</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" /> Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">2FA Enabled</span>
                <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Login</span>
                <span className="text-sm font-medium">Just now</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Settings */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your contact details and display name.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input defaultValue="System" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input defaultValue="Admin" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" /> Email Address
                </label>
                <Input defaultValue={user?.email || "admin@store.com"} disabled />
                <p className="text-xs text-muted-foreground">Email addresses cannot be changed directly. Contact support if you need to migrate this account.</p>
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password & Authentication</CardTitle>
              <CardDescription>Secure your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We will send a secure link to your email address allowing you to reset your password.
              </p>
              <Button variant="outline" onClick={handlePasswordReset}>
                <Key className="w-4 h-4 mr-2" /> Request Password Reset
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" /> Recent Account Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <p className="text-sm font-medium">Successful Login</p>
                    <p className="text-xs text-muted-foreground">IP: 192.168.1.1 • Windows • Chrome</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Just now</span>
                </div>
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <p className="text-sm font-medium">Updated Store Settings</p>
                    <p className="text-xs text-muted-foreground">Changed free delivery threshold.</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">Successful Login</p>
                    <p className="text-xs text-muted-foreground">IP: 192.168.1.1 • Windows • Chrome</p>
                  </div>
                  <span className="text-xs text-muted-foreground">3 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
