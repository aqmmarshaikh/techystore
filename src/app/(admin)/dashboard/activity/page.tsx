"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Plus, Edit, Trash, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Mock interface for Audit Logs since we haven't populated them yet
interface AuditLog {
  id: string;
  adminEmail: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "SYSTEM";
  resourceType: string;
  resourceId: string;
  timestamp: string;
  details: string;
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching audit logs from Firestore
    setTimeout(() => {
      setLogs([
        {
          id: "log-1",
          adminEmail: "ammarshaikh6100@gmail.com",
          action: "UPDATE",
          resourceType: "Global Settings",
          resourceId: "settings-doc",
          timestamp: new Date().toISOString(),
          details: "Updated free delivery threshold to ₹999",
        },
        {
          id: "log-2",
          adminEmail: "ammarshaikh6100@gmail.com",
          action: "CREATE",
          resourceType: "Product",
          resourceId: "prod-12345",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: "Created 'Premium Wireless Headphones'",
        },
        {
          id: "log-3",
          adminEmail: "system@freshmart.com",
          action: "SYSTEM",
          resourceType: "Database Index",
          resourceId: "idx-products",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          details: "Automated index generation complete",
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE": return <Plus className="w-4 h-4 text-green-500" />;
      case "UPDATE": return <Edit className="w-4 h-4 text-blue-500" />;
      case "DELETE": return <Trash className="w-4 h-4 text-red-500" />;
      default: return <Settings className="w-4 h-4 text-slate-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">CREATE</Badge>;
      case "UPDATE": return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">UPDATE</Badge>;
      case "DELETE": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">DELETE</Badge>;
      default: return <Badge variant="secondary">SYSTEM</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-2">Track administrative activities and system events.</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <Activity className="w-6 h-6 text-primary" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No activity logs found.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 border-b border-dashed pb-6 last:border-0 last:pb-0">
                  <div className="mt-1 p-2 bg-slate-100 rounded-full flex-shrink-0">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        <span className="font-semibold">{log.adminEmail}</span> performed an action on {log.resourceType}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {getActionBadge(log.action)}
                      <span className="text-sm text-muted-foreground">{log.details}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-2">ID: {log.resourceId}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
