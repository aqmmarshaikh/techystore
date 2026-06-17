"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, AlertCircle, Activity, Database, MessageSquare, Undo2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
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
            <div className="text-xl lg:text-2xl font-bold">₹45k</div>
            <p className="text-xs text-muted-foreground mt-1">+20.1%</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground mt-1">+18%</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">+12.2k</div>
            <p className="text-xs text-muted-foreground mt-1">+19%</p>
          </CardContent>
        </Card>
        
        {/* NEW PART 18 DATA */}
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-green-600">3.24%</div>
            <p className="text-xs text-muted-foreground mt-1">Avg. Buy Rate</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-blue-600">99.9%</div>
            <p className="text-xs text-muted-foreground mt-1">Firestore Uptime</p>
          </CardContent>
        </Card>
        
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-destructive">12</div>
            <p className="text-xs text-muted-foreground mt-1">Needs restock</p>
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
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Order #ORD-{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">customer{i}@example.com</p>
                  </div>
                  <div className="font-medium">₹{(1299 * i).toLocaleString()}</div>
                </div>
              ))}
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
                    <p className="font-medium text-orange-900">14 Pending Returns</p>
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
                    <p className="font-medium text-blue-900">8 Open Support Tickets</p>
                    <p className="text-xs text-blue-700">3 waiting for more than 24 hours</p>
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
                    <p className="font-medium text-red-900">12 Low-Stock Alerts</p>
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
