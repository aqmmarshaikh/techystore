"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    storeName: "TechyMart",
    freeDeliveryThreshold: 999,
    cancellationWindow: 24, // hours
    supportName: "Ammar Shaikh",
    supportNumber: "7801986978",
    pickupEnabled: true,
    maintenanceMode: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call to save settings
    setTimeout(() => {
      setLoading(false);
      toast.success("Global settings updated successfully.");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Settings</h1>
        <p className="text-muted-foreground mt-2">Manage store configuration and operations.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Delivery & Operations</CardTitle>
            <CardDescription>Configure shipping thresholds and fulfillment options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="threshold">Free Delivery Threshold (₹)</Label>
              <Input
                id="threshold"
                type="number"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cancellationWindow">Order Cancellation Window (Hours)</Label>
              <Input
                id="cancellationWindow"
                type="number"
                value={settings.cancellationWindow}
                onChange={(e) => setSettings({ ...settings, cancellationWindow: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Customers can cancel their orders within this timeframe.</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Local Pickup</Label>
                <p className="text-sm text-muted-foreground">Allow customers to pick up orders from headquarters.</p>
              </div>
              <Switch
                checked={settings.pickupEnabled}
                onCheckedChange={(c) => setSettings({ ...settings, pickupEnabled: c })}
              />
            </div>
            <div className="flex items-center justify-between border-t pt-6">
              <div className="space-y-0.5">
                <Label className="text-destructive">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Disable the storefront temporarily.</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(c) => setSettings({ ...settings, maintenanceMode: c })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Support</CardTitle>
            <CardDescription>Details displayed on the Contact Us and Footer sections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="supportName">Support Representative Name</Label>
              <Input
                id="supportName"
                value={settings.supportName}
                onChange={(e) => setSettings({ ...settings, supportName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supportNumber">Support Phone Number</Label>
              <Input
                id="supportNumber"
                value={settings.supportNumber}
                onChange={(e) => setSettings({ ...settings, supportNumber: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full sm:w-auto h-12 px-8">
          {loading ? "Saving..." : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
