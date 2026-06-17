"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, BellRing, Trash2, BarChart2 } from "lucide-react";
import { useState, useEffect } from "react";
import { BroadcastService, Broadcast } from "@/services/broadcast.service";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NotificationHistoryPage() {
  const { user } = useAuthStore();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New Broadcast Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("All Customers");
  const [type, setType] = useState("Promotional Offers");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const data = await BroadcastService.getAllBroadcasts();
      setBroadcasts(data);
      
      // Fetch analytics for all delivered broadcasts
      const stats: Record<string, any> = {};
      await Promise.all(data.map(async (b) => {
        if (b.status === "Delivered") {
          stats[b.id!] = await BroadcastService.getBroadcastAnalytics(b.id!);
        }
      }));
      setAnalytics(stats);
    } catch (error) {
      toast.error("Failed to fetch broadcasts");
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSending(true);
    try {
      await BroadcastService.createBroadcast({
        title,
        message,
        audienceType: audience,
        type,
        status: "Delivered",
        sentAt: new Date().toISOString(),
        createdBy: user?.uid || "admin",
        createdAt: new Date().toISOString()
      });
      toast.success("Broadcast sent successfully!");
      setIsDialogOpen(false);
      setTitle("");
      setMessage("");
      fetchBroadcasts();
    } catch (error) {
      toast.error("Failed to send broadcast");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this broadcast record?")) return;
    try {
      await BroadcastService.deleteBroadcast(id);
      setBroadcasts(prev => prev.filter(b => b.id !== id));
      toast.success("Broadcast deleted");
    } catch (error) {
      toast.error("Failed to delete broadcast");
    }
  };

  const filtered = broadcasts.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Push Broadcast Center</h1>
          <p className="text-muted-foreground mt-1">Send and track in-app notifications to customers.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Send className="w-4 h-4 mr-2" /> New Broadcast
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSendBroadcast}>
              <DialogHeader>
                <DialogTitle>Create Broadcast</DialogTitle>
                <DialogDescription>
                  Send an instant in-app notification to your targeted audience.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Diwali Mega Sale! 🪔" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message Body</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Enter the notification content..." 
                    rows={3}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Audience</Label>
                    <Select value={audience} onValueChange={(val) => { if (val) setAudience(val); }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Customers">All Customers</SelectItem>
                        <SelectItem value="Customers with Orders">Customers with Orders</SelectItem>
                        <SelectItem value="VIP Customers">VIP Customers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select value={type} onValueChange={(val) => { if (val) setType(val); }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Promotional Offers">Promotional Offers</SelectItem>
                        <SelectItem value="Order Updates">Order Updates</SelectItem>
                        <SelectItem value="Store Announcements">Store Announcements</SelectItem>
                        <SelectItem value="Maintenance Alerts">Maintenance Alerts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSending}>
                  {isSending ? "Sending..." : "Send Instantly"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg">Broadcast Log</CardTitle>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input 
              placeholder="Search campaigns..." 
              className="pl-9 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><LoadingSpinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
              No broadcasts found. Create one to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(broadcast => {
                const stat = analytics[broadcast.id!] || { totalTargeted: 0, readCount: 0, unreadCount: 0 };
                const openRate = stat.totalTargeted > 0 ? Math.round((stat.readCount / stat.totalTargeted) * 100) : 0;
                
                return (
                  <div key={broadcast.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{broadcast.title}</h3>
                        {broadcast.status === "Delivered" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">Delivered</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 animate-pulse">{broadcast.status}</Badge>
                        )}
                        <Badge variant="outline" className="text-xs font-normal ml-2">{broadcast.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{broadcast.message}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><BellRing className="w-3 h-3" /> {broadcast.audienceType}</span>
                        <span>Sent: {broadcast.sentAt ? format(new Date(broadcast.sentAt), "MMM d, yyyy h:mm a") : "N/A"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 md:pl-6 md:border-l">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{stat.totalTargeted.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total Sent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stat.readCount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Read</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{openRate}%</p>
                        <p className="text-xs text-muted-foreground">Delivery Rate</p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(broadcast.id!)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
