"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuditService, AuditLog } from "@/services/audit.service";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldAlert, FileText, ShoppingCart, Tag, Bell } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await AuditService.getLogs(100);
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoading(false);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "Product": return <ShoppingCart className="w-4 h-4 text-blue-500" />;
      case "Order": return <FileText className="w-4 h-4 text-green-500" />;
      case "Coupon": return <Tag className="w-4 h-4 text-purple-500" />;
      case "Return": return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case "Broadcast": return <Bell className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security & Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Track all administrative actions across the platform.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-12"><LoadingSpinner /></div>
          ) : logs.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">
              No audit logs found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Admin ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                      {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit bg-slate-50">
                        {getEntityIcon(log.entityType)} {log.entityType}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-sm">
                      {log.details}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.adminId}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
