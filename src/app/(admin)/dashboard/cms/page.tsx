"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LayoutTemplate, Save, Megaphone, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function CMSPage() {
  const [announcement, setAnnouncement] = useState("🎉 HUGE SALE! Get 50% off all Electronics this weekend only.");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Content saved successfully");
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management System</h1>
          <p className="text-muted-foreground mt-1">Manage storefront banners, announcements, and legal text.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" /> Top Announcement Bar
            </CardTitle>
            <CardDescription>This text appears at the very top of the website on all pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Message Text</label>
              <Input 
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Link URL (Optional)</label>
              <Input placeholder="https://..." defaultValue="/offers" />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="text-sm">Preview:</span>
              <Badge className="bg-primary hover:bg-primary px-4 py-1 text-xs">
                {announcement}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" /> Homepage Hero Banner
            </CardTitle>
            <CardDescription>Manage the main promotional banner on the homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Headline</label>
              <Input defaultValue="Premium Electronics Sale" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subheadline</label>
              <Textarea defaultValue="Discover the latest gadgets and accessories at unbeatable prices. Upgrade your tech today." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Call to Action Button Text</label>
              <Input defaultValue="Shop Collection" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-green-500" /> Legal Pages
            </CardTitle>
            <CardDescription>Update your store's terms, conditions, and policies.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-center">
                <h4 className="font-semibold mb-1">Privacy Policy</h4>
                <p className="text-xs text-muted-foreground">Last updated: 2 months ago</p>
                <Button variant="outline" size="sm" className="mt-4 w-full">Edit Content</Button>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-center">
                <h4 className="font-semibold mb-1">Terms of Service</h4>
                <p className="text-xs text-muted-foreground">Last updated: 1 year ago</p>
                <Button variant="outline" size="sm" className="mt-4 w-full">Edit Content</Button>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-center">
                <h4 className="font-semibold mb-1">Return Policy</h4>
                <p className="text-xs text-muted-foreground">Last updated: 3 weeks ago</p>
                <Button variant="outline" size="sm" className="mt-4 w-full">Edit Content</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
