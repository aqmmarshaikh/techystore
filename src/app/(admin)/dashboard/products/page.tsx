"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Download } from "lucide-react";
import { ProductService } from "@/services/product.service";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // In a real app, we would fetch from Firebase.
    // For this demonstration, we'll fetch from our service and add mock data if empty.
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getProducts();
        setProducts(data.length > 0 ? data : [
          {
            id: "1",
            title: "Premium Wireless Headphones",
            slug: "premium-wireless-headphones",
            description: "High quality noise-cancelling headphones.",
            price: 12999,
            salePrice: 9999,
            images: [],
            categoryId: "electronics",
            stock: 10,
            rating: 4.8,
            reviewsCount: 124,
            featured: true,
            isActive: true,
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const handleExportCSV = () => {
    if (products.length === 0) {
      toast.error("No products to export");
      return;
    }
    
    // Define headers
    const headers = ["ID", "Title", "Category", "Price", "Sale Price", "Stock", "Status", "Rating"];
    
    // Create rows
    const csvRows = products.map(p => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.categoryId,
      p.price,
      p.salePrice || "",
      p.stock,
      p.isActive ? "Active" : "Draft",
      p.rating
    ].join(','));
    
    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV Exported Successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading products...</TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">No products found.</TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted flex-shrink-0" />
                      <div>
                        <p className="line-clamp-1">{product.title}</p>
                        <p className="text-xs text-muted-foreground">{product.categoryId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.isActive ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={product.stock < 10 ? "text-destructive font-medium" : ""}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>₹{product.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Edit" onClick={() => toast.info("Edit feature coming soon!")}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Delete" 
                      className="text-destructive"
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this product?")) {
                          try {
                            const { ProductService } = await import("@/services/product.service");
                            await ProductService.deleteProduct(product.id);
                            toast.success("Product deleted successfully");
                            setProducts(prev => prev.filter(p => p.id !== product.id));
                          } catch (error) {
                            toast.error("Failed to delete product");
                          }
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
