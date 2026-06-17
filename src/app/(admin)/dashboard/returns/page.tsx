"use client";

import { useState, useEffect } from "react";
import { ReturnRequestService } from "@/services/return.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeftRight, Eye, MoreHorizontal, StickyNote, CheckCircle, XCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const data = await ReturnRequestService.getAllReturns();
      setReturns(data);
    } catch (error) {
      toast.error("Failed to fetch returns");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await ReturnRequestService.updateReturnStatus(id, newStatus);
      toast.success("Return status updated");
      setReturns((prev) =>
        prev.map((ret) =>
          ret.id === id ? { ...ret, status: newStatus } : ret
        )
      );
    } catch (error) {
      toast.error("Failed to update return status");
    }
  };

  const handleAddNote = async (id: string) => {
    const note = prompt("Enter admin note for return request " + id.slice(0, 8) + ":");
    if (note) {
      try {
        await ReturnRequestService.updateReturnNotes(id, note);
        toast.success("Note added successfully");
        setReturns((prev) =>
          prev.map((ret) =>
            ret.id === id ? { ...ret, adminNotes: note } : ret
          )
        );
      } catch (error) {
        toast.error("Failed to add note");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "received": return "bg-purple-100 text-purple-800";
      case "refunded": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Return Requests</h1>
      </div>

      <div className="border rounded-lg bg-card">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : returns.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <ArrowLeftRight className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-medium">No return requests found</h3>
            <p className="text-sm text-muted-foreground mt-1">When customers request returns, they will appear here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.map((ret) => (
                <TableRow key={ret.id}>
                  <TableCell className="font-medium">
                    {ret.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {ret.createdAt ? format(new Date(ret.createdAt), "MMM d, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>
                    {ret.orderId?.slice(0, 8).toUpperCase() || "Unknown"}
                  </TableCell>
                  <TableCell className="truncate max-w-xs">
                    {ret.reason || "No reason provided"}
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={ret.status || "pending"}
                      onValueChange={(value) => handleStatusUpdate(ret.id, value)}
                    >
                      <SelectTrigger className={`h-8 w-[130px] border-0 ${getStatusColor(ret.status || "pending")}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="received">Item Received</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 hover:bg-slate-100 rounded-md inline-flex items-center justify-center">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="cursor-pointer font-medium text-green-600" onClick={() => handleStatusUpdate(ret.id, "approved")}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Approve Return
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-medium text-red-600" onClick={() => handleStatusUpdate(ret.id, "rejected")}>
                          <XCircle className="mr-2 h-4 w-4" /> Reject Return
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAddNote(ret.id)}>
                          <StickyNote className="mr-2 h-4 w-4" /> Add Admin Note
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
