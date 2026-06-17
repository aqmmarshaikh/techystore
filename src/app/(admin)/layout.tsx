import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Tags,
  Undo2,
  Activity,
  Truck,
  MessageSquare,
  ShoppingBag,
  BarChart3,
  Database,
  FileDown,
  LayoutTemplate,
  AlertTriangle,
  UserCircle,
  BellRing
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="flex min-h-screen bg-slate-50/50">
        {/* Admin Sidebar */}
        <aside className="w-64 border-r bg-card flex-shrink-0 hidden md:flex flex-col">
          <div className="h-16 flex items-center px-6 border-b">
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
          <nav className="flex-1 py-6 px-4 space-y-2">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
              Dashboard
            </Link>
            <Link 
              href="/dashboard/products" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <Package className="w-4 h-4 text-muted-foreground" />
              Products
            </Link>
            <Link 
              href="/dashboard/categories" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <Tags className="w-4 h-4 text-muted-foreground" />
              Categories
            </Link>
            <Link 
              href="/dashboard/orders" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              Orders
            </Link>
            <Link 
              href="/dashboard/delivery" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <Truck className="w-4 h-4 text-muted-foreground" />
              Delivery
            </Link>
            <Link 
              href="/dashboard/tickets" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Support
            </Link>
            <Link 
              href="/dashboard/coupons" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <Tags className="w-4 h-4 text-muted-foreground" />
              Coupons
            </Link>
            <Link 
              href="/dashboard/returns" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <Undo2 className="w-4 h-4 text-muted-foreground" />
              Returns
            </Link>
            <Link 
              href="/dashboard/customers" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <Users className="w-4 h-4 text-muted-foreground" />
              Customers
            </Link>
            <Link 
              href="/dashboard/audit" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <Activity className="w-4 h-4 text-muted-foreground" />
              Audit Logs
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              Settings
            </Link>
            <div className="pt-4 mt-4 border-t border-border">
              <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Command Center
              </span>
            </div>
            <Link 
              href="/dashboard/analytics" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              Analytics
            </Link>
            <Link 
              href="/dashboard/inventory" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              Inventory & Alerts
            </Link>
            <Link 
              href="/dashboard/import-export" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <FileDown className="w-4 h-4 text-muted-foreground" />
              Import / Export
            </Link>
            <Link 
              href="/dashboard/cms" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
              Content (CMS)
            </Link>
            <Link 
              href="/dashboard/health" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <Database className="w-4 h-4 text-muted-foreground" />
              System Health
            </Link>
            <Link 
              href="/dashboard/broadcasts" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <BellRing className="w-4 h-4 text-muted-foreground" />
              Broadcasts
            </Link>
            <Link 
              href="/dashboard/profile" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
            >
              <UserCircle className="w-4 h-4 text-muted-foreground" />
              Admin Profile
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
