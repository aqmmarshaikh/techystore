"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Clock, Trash2, Plus, Truck } from "lucide-react";

interface DeliverySlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

export default function DeliveryManagementPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [slots, setSlots] = useState<DeliverySlot[]>([
    { id: "1", label: "Morning", startTime: "09:00", endTime: "12:00", active: true },
    { id: "2", label: "Afternoon", startTime: "13:00", endTime: "17:00", active: true },
    { id: "3", label: "Evening", startTime: "18:00", endTime: "21:00", active: false },
  ]);

  const addSlot = () => {
    setSlots([
      ...slots,
      { id: Date.now().toString(), label: "New Slot", startTime: "00:00", endTime: "00:00", active: true }
    ]);
  };

  const removeSlot = (id: string) => {
    setSlots(slots.filter(s => s.id !== id));
  };

  const updateSlot = (id: string, field: keyof DeliverySlot, value: any) => {
    setSlots(slots.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call to save delivery settings
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Delivery settings updated successfully");
    } catch (error) {
      toast.error("Failed to update delivery settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Management</h1>
          <p className="text-muted-foreground mt-2">Configure delivery slots and pickup options.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              <CardTitle>Delivery Slots</CardTitle>
            </div>
            <CardDescription>Define the time windows customers can select for order delivery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {slots.map((slot) => (
                <div key={slot.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end p-4 border rounded-xl bg-slate-50/50">
                  <div className="flex-1 space-y-2 w-full">
                    <Label>Slot Label</Label>
                    <Input 
                      value={slot.label} 
                      onChange={(e) => updateSlot(slot.id, "label", e.target.value)} 
                      placeholder="e.g. Morning, Afternoon"
                    />
                  </div>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <div className="space-y-2 flex-1 sm:flex-none sm:w-32">
                      <Label>Start Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="time" 
                          value={slot.startTime} 
                          onChange={(e) => updateSlot(slot.id, "startTime", e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 flex-1 sm:flex-none sm:w-32">
                      <Label>End Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="time" 
                          value={slot.endTime} 
                          onChange={(e) => updateSlot(slot.id, "endTime", e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 h-10 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="flex items-center gap-2 flex-1">
                      <Switch 
                        checked={slot.active} 
                        onCheckedChange={(checked) => updateSlot(slot.id, "active", checked)}
                      />
                      <span className="text-sm text-muted-foreground">{slot.active ? "Active" : "Disabled"}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeSlot(slot.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={addSlot} className="w-full border-dashed">
              <Plus className="w-4 h-4 mr-2" />
              Add Delivery Slot
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In-Store Pickup</CardTitle>
            <CardDescription>Allow customers to pick up their orders directly from your store.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-xl">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Enable Store Pickup</Label>
                <p className="text-sm text-muted-foreground">Customers won't be charged for delivery if they choose to pick up.</p>
              </div>
              <Switch checked={pickupEnabled} onCheckedChange={setPickupEnabled} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
