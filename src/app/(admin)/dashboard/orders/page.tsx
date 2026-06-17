"use client";

import { useState, useEffect } from "react";
import { OrderService } from "@/services/order.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { Eye, PackageSearch, MoreHorizontal, Printer, Mail, CheckCircle, Package, Truck } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await OrderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await OrderService.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated to " + newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handlePrintInvoice = (orderId: string) => {
    toast.info(`Generating invoice for ${orderId.slice(0,8).toUpperCase()}...`);
    setTimeout(() => toast.success("Invoice downloading..."), 1000);
  };

  const handleContactCustomer = () => {
    toast.info("Opening email client...");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>

      <div className="border rounded-lg bg-card">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <PackageSearch className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-medium">No orders found</h3>
            <p className="text-sm text-muted-foreground mt-1">When customers place orders, they will appear here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>
                    {order.shippingAddress?.fullName || "Unknown"}
                  </TableCell>
                  <TableCell>
                    ₹{order.total?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status || "pending"}
                      onValueChange={(value) => handleStatusUpdate(order.id, value)}
                    >
                      <SelectTrigger className={`h-8 w-[130px] border-0 ${getStatusColor(order.status || "pending")}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
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
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.id)}>
                            Copy Order ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => handleStatusUpdate(order.id, "processing")}>
                            <Package className="mr-2 h-4 w-4" /> Mark as Packed
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => handleStatusUpdate(order.id, "shipped")}>
                            <Truck className="mr-2 h-4 w-4" /> Mark as Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer font-medium text-green-600" onClick={() => handleStatusUpdate(order.id, "delivered")}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Mark as Delivered
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handlePrintInvoice(order.id)}>
                            <Printer className="mr-2 h-4 w-4" /> Print Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleContactCustomer}>
                            <Mail className="mr-2 h-4 w-4" /> Contact Customer
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
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
