"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Ticket, MessageSquare, Clock, CheckCircle2, 
  Search, Filter, Send
} from "lucide-react";
import { toast } from "sonner";
import { TicketService, SupportTicket } from "@/services/ticket.service";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";

export default function SupportTicketsPage() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  
  // Reply State
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await TicketService.getAllTickets();
      setTickets(data);
    } catch (error) {
      toast.error("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: SupportTicket["status"]) => {
    if (!selectedTicket) return;
    try {
      await TicketService.updateTicket(selectedTicket.id!, { status: newStatus });
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: newStatus } : t));
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Ticket marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handlePriorityChange = async (newPriority: SupportTicket["priority"]) => {
    if (!selectedTicket) return;
    try {
      await TicketService.updateTicket(selectedTicket.id!, { priority: newPriority });
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, priority: newPriority } : t));
      setSelectedTicket(prev => prev ? { ...prev, priority: newPriority } : null);
      toast.success(`Priority updated to ${newPriority}`);
    } catch (error) {
      toast.error("Failed to update priority");
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setIsReplying(true);
    try {
      // In a real app with subcollections, we'd add to messages subcollection.
      // For this MVP, we will append adminNotes to act as the internal response log or just update status
      const updatedNotes = selectedTicket.adminNotes 
        ? `${selectedTicket.adminNotes}\n[Admin]: ${replyText}` 
        : `[Admin]: ${replyText}`;
      
      await TicketService.updateTicket(selectedTicket.id!, { 
        adminNotes: updatedNotes,
        status: "Waiting for Customer"
      });
      
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, adminNotes: updatedNotes, status: "Waiting for Customer" } : t));
      setSelectedTicket(prev => prev ? { ...prev, adminNotes: updatedNotes, status: "Waiting for Customer" } : null);
      setReplyText("");
      toast.success("Reply recorded");
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "High":
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "Open": return "bg-blue-100 text-blue-800";
      case "In Progress": return "bg-purple-100 text-purple-800";
      case "Waiting for Customer": return "bg-amber-100 text-amber-800";
      case "Resolved": return "bg-emerald-100 text-emerald-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
          <p className="text-muted-foreground mt-1">Manage and resolve customer support tickets.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Ticket List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          <CardHeader className="border-b px-4 py-3 space-y-0">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-lg">Inbox</CardTitle>
              <Badge variant="secondary">{filteredTickets.length}</Badge>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "All")}>
                <SelectTrigger className="w-[110px]">
                  <Filter className="w-4 h-4 mr-2" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Waiting for Customer">Waiting</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8"><LoadingSpinner /></div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">No tickets found.</div>
            ) : (
              <div className="divide-y">
                {filteredTickets.map(ticket => (
                  <div 
                    key={ticket.id} 
                    className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-slate-50 border-l-4 border-l-primary' : ''}`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm line-clamp-1">{ticket.subject}</h4>
                      <Badge variant="outline" className={`text-[10px] uppercase border-0 ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                      <span>{ticket.userName}</span>
                      <span>{format(new Date(ticket.createdAt), "MMM d")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Details */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              <CardHeader className="border-b bg-slate-50/50">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>From: <span className="font-medium text-foreground">{selectedTicket.userName}</span> ({selectedTicket.userEmail})</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(selectedTicket.createdAt), "PPp")}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <Select value={selectedTicket.status} onValueChange={(val) => { if (val) handleStatusChange(val as any) }}>
                      <SelectTrigger className={`h-8 text-xs ${getStatusColor(selectedTicket.status)} border-0`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Waiting for Customer">Waiting for Customer</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedTicket.priority} onValueChange={(val) => { if (val) handlePriorityChange(val as any) }}>
                      <SelectTrigger className={`h-8 text-xs ${getPriorityColor(selectedTicket.priority)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low Priority</SelectItem>
                        <SelectItem value="Medium">Medium Priority</SelectItem>
                        <SelectItem value="High">High Priority</SelectItem>
                        <SelectItem value="Critical">Critical Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                
                {/* Customer Message */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 font-bold">
                    {selectedTicket.userName.charAt(0)}
                  </div>
                  <div className="flex-1 bg-slate-50 p-4 rounded-lg border">
                    <p className="text-sm">{selectedTicket.message}</p>
                  </div>
                </div>

                {/* Internal Admin Notes / Replies log */}
                {selectedTicket.adminNotes && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">Internal Admin Log</h4>
                    <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 text-sm whitespace-pre-wrap">
                      {selectedTicket.adminNotes}
                    </div>
                  </div>
                )}

              </CardContent>
              
              {/* Reply Box */}
              <div className="p-4 border-t bg-slate-50">
                <div className="flex flex-col gap-2">
                  <Textarea 
                    placeholder="Add an internal note or record a reply..." 
                    className="min-h-[100px] resize-none"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Notes are visible to admins only in this MVP.</span>
                    <Button onClick={handleReply} disabled={isReplying || !replyText.trim()}>
                      <Send className="w-4 h-4 mr-2" /> Add Note
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
              <MessageSquare className="w-12 h-12 mb-4 text-slate-200" />
              <h3 className="text-lg font-medium mb-1">No ticket selected</h3>
              <p className="text-sm">Select a ticket from the inbox to view details and respond.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
