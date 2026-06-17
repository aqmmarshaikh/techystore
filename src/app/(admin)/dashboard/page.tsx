"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, AlertCircle, Activity, Database, MessageSquare, Undo2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    conversion: 0,
    health: 100,
    lowStockCount: 0,
    pendingReturns: 0,
    openTickets: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Orders for aggregate metrics
        const ordersSnap = await getDocs(collection(db, "orders"));
        let totalRevenue = 0;
        let totalOrders = 0;
        ordersSnap.forEach((doc) => {
          totalOrders++;
          totalRevenue += (doc.data().total || 0);
        });

        // Fetch Customers
        const usersSnap = await getDocs(collection(db, "users"));
        const totalCustomers = usersSnap.size;

        const conversionRate = totalCustomers > 0 ? ((totalOrders / totalCustomers) * 100).toFixed(2) : "0.00";

        // Fetch Low Stock Products
        const productsSnap = await getDocs(query(collection(db, "products"), where("stock", "<=", 5)));
        const lowStockCount = productsSnap.size;

        // Fetch Pending Returns
        const returnsSnap = await getDocs(query(collection(db, "returnRequests"), where("status", "==", "pending")));
        const pendingReturns = returnsSnap.size;

        // Fetch Open Tickets
        const ticketsSnap = await getDocs(query(collection(db, "tickets"), where("status", "==", "Open")));
        const openTickets = ticketsSnap.size;

        setMetrics({
          revenue: totalRevenue,
          orders: totalOrders,
          customers: totalCustomers,
          conversion: Number(conversionRate),
          health: 100,
          lowStockCount,
          pendingReturns,
          openTickets,
        });

        // Fetch Recent Orders (Needs index or client sort, but basic orderBy often works if simple)
        try {
          const recentOrdersQ = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
          const recentOrdersSnap = await getDocs(recentOrdersQ);
          const recentOrdList: any[] = [];
          recentOrdersSnap.forEach((doc) => {
            recentOrdList.push({ id: doc.id, ...doc.data() });
          });
          setRecentOrders(recentOrdList);
        } catch (e) {
          // If orderBy throws due to missing index, fallback to sorting locally
          const allOrders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          allOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentOrders(allOrders.slice(0, 5));
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome back, Admin. Here is your store&apos;s summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-6">
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">₹{metrics.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Real-time total</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">{metrics.orders}</div>
            <p className="text-xs text-muted-foreground mt-1">Real-time total</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">{metrics.customers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered users</p>
          </CardContent>
        </Card>
        
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-green-600">{metrics.conversion}%</div>
            <p className="text-xs text-muted-foreground mt-1">Orders per user</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-blue-600">{metrics.health}%</div>
            <p className="text-xs text-muted-foreground mt-1">Firestore Uptime</p>
          </CardContent>
        </Card>
        
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-destructive">{metrics.lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Items &le; 5 qty</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading recent orders...</p>
              ) : recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground border-2 border-dashed rounded-lg p-6 text-center">No orders available yet.</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Order #{order.id.substring(0, 8)}...</p>
                      <p className="text-sm text-muted-foreground">{order.customerEmail || "Guest"}</p>
                    </div>
                    <div className="font-medium">₹{(order.total || 0).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Command Center Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                    <Undo2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-orange-900">{metrics.pendingReturns} Pending Returns</p>
                    <p className="text-xs text-orange-700">Require approval or processing</p>
                  </div>
                </div>
                <Link href="/dashboard/returns" className="text-sm font-medium text-orange-700 flex items-center hover:underline">
                  Review <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">{metrics.openTickets} Open Support Tickets</p>
                    <p className="text-xs text-blue-700">Awaiting response</p>
                  </div>
                </div>
                <Link href="/dashboard/tickets" className="text-sm font-medium text-blue-700 flex items-center hover:underline">
                  Respond <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-full">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-red-900">{metrics.lowStockCount} Low-Stock Alerts</p>
                    <p className="text-xs text-red-700">Inventory critically low</p>
                  </div>
                </div>
                <Link href="/dashboard/inventory" className="text-sm font-medium text-red-700 flex items-center hover:underline">
                  Manage <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
