"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, Activity, HardDrive, WifiOff, ServerCrash, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DatabaseHealthPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching health statistics
    setTimeout(() => setLoading(false), 600);
  }, []);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Health Center</h1>
          <p className="text-muted-foreground mt-1">Monitor Firestore read/write costs and system performance.</p>
        </div>
        <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full flex items-center text-sm font-medium border border-green-200">
          <CheckCircle2 className="w-4 h-4 mr-2" /> All Systems Operational
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Firestore Reads (Est.)</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-[100px]" /> : (
              <>
                <div className="text-2xl font-bold">14,234</div>
                <p className="text-xs text-muted-foreground mt-1">Today's limit: 50,000</p>
                <Progress value={(14234 / 50000) * 100} className="mt-3 h-2" />
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Firestore Writes (Est.)</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-[100px]" /> : (
              <>
                <div className="text-2xl font-bold">2,105</div>
                <p className="text-xs text-muted-foreground mt-1">Today's limit: 20,000</p>
                <Progress value={(2105 / 20000) * 100} className="mt-3 h-2" />
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-[100px]" /> : (
              <>
                <div className="text-2xl font-bold">1.2 GB</div>
                <p className="text-xs text-muted-foreground mt-1">Total capacity: 5.0 GB</p>
                <Progress value={(1.2 / 5.0) * 100} className="mt-3 h-2" />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ServerCrash className="w-5 h-5 text-orange-500" /> Slow Queries Detected
            </CardTitle>
            <CardDescription>Queries taking longer than 1500ms to resolve.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[200px] w-full" /> : (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border text-sm font-mono">
                  <div className="flex justify-between text-orange-600 mb-2">
                    <span>Query: getDocs(collection(db, "products"))</span>
                    <span>1850ms</span>
                  </div>
                  <p className="text-muted-foreground">Cause: Missing composite index on categoryId + price_desc.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border text-sm font-mono">
                  <div className="flex justify-between text-orange-600 mb-2">
                    <span>Query: getDocs(collection(db, "orders"))</span>
                    <span>1600ms</span>
                  </div>
                  <p className="text-muted-foreground">Cause: Large collection fetch without limit().</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-red-500" /> Failed Requests Log
            </CardTitle>
            <CardDescription>Recent API failures and permission denials.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[200px] w-full" /> : (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border text-sm font-mono border-l-4 border-l-red-500">
                  <div className="font-semibold text-red-600">permission-denied</div>
                  <p className="text-muted-foreground mt-1">User id: anonymous attempted to write to "system_settings".</p>
                  <p className="text-xs text-slate-400 mt-2">14 mins ago</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border text-sm font-mono border-l-4 border-l-red-500">
                  <div className="font-semibold text-red-600">quota-exceeded</div>
                  <p className="text-muted-foreground mt-1">Cloud functions execution timeout on resize_image triggers.</p>
                  <p className="text-xs text-slate-400 mt-2">2 hours ago</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
