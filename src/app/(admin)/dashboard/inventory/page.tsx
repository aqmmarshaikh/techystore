"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Package, TrendingDown, Download, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductService } from "@/services/product.service";
import { Product } from "@/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(10); // Configurable threshold

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await ProductService.getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load inventory:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const lowStockProducts = products.filter(p => p.stock <= threshold);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const handleExportCSV = () => {
    if (lowStockProducts.length === 0) {
      toast.error("No low-stock products to export");
      return;
    }
    
    const headers = ["ID", "Title", "Category", "Current Stock", "Threshold"];
    const csvRows = lowStockProducts.map(p => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.categoryId,
      p.stock,
      threshold
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `low_stock_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Low Stock Report Exported Successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Low Stock Command Center</h1>
          <p className="text-muted-foreground mt-1">Automatically detect and manage low-stock inventory.</p>
        </div>
        <Button onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Out of Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-[100px]" /> : (
              <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length} Items</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Low Stock Warning</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-[100px]" /> : (
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length - outOfStockProducts.length} Items</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alert Threshold</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                value={threshold} 
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-20 font-bold"
              />
              <span className="text-sm text-muted-foreground">Units</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-muted-foreground" />
            Products Requiring Attention
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Quick Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Scanning inventory...</TableCell>
              </TableRow>
            ) : lowStockProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-green-600">All inventory levels are healthy!</TableCell>
              </TableRow>
            ) : (
              lowStockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium line-clamp-1 max-w-[200px]">{product.title}</TableCell>
                  <TableCell className="text-muted-foreground">{product.categoryId}</TableCell>
                  <TableCell>
                    <span className="font-bold text-lg">{product.stock}</span>
                  </TableCell>
                  <TableCell>
                    {product.stock === 0 ? (
                      <Badge variant="destructive">Depleted</Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">Low Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        try {
                          await ProductService.updateProduct(product.id, { stock: product.stock + 50 });
                          toast.success("Restocked 50 units");
                          setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock + 50 } : p));
                        } catch (e) {
                          toast.error("Failed to restock");
                        }
                      }}
                    >
                      Restock +50
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
