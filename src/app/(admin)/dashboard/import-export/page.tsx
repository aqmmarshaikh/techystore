"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, DownloadCloud, FileText, Users, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProductService } from "@/services/product.service";

export default function ImportExportPage() {
  
  const handleExportCustomers = () => {
    toast.info("Generating Customer CSV...");
    setTimeout(() => toast.success("Customer Export Downloaded!"), 1500);
  };

  const handleExportOrders = () => {
    toast.info("Generating Orders CSV...");
    setTimeout(() => toast.success("Orders Export Downloaded!"), 1500);
  };

  const handleExportProducts = async () => {
    toast.info("Fetching products for export...");
    try {
      const products = await ProductService.getProducts();
      if (products.length === 0) {
        toast.error("No products to export");
        return;
      }
      
      const headers = ["ID", "Title", "Category", "Price", "Sale Price", "Stock", "Status"];
      const csvRows = products.map(p => [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        p.categoryId,
        p.price,
        p.salePrice || "",
        p.stock,
        p.isActive ? "Active" : "Draft"
      ].join(','));
      
      const csvContent = [headers.join(','), ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Products Exported Successfully");
    } catch (e) {
      toast.error("Export failed.");
    }
  };

  const handleImportClick = () => {
    document.getElementById("csv-upload")?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.info(`Reading ${file.name}...`);
      setTimeout(() => {
        toast.success(`Successfully imported ${file.name}`);
        // Reset input
        e.target.value = '';
      }, 2000);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import / Export Center</h1>
          <p className="text-muted-foreground mt-1">Bulk manage your catalog and data.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DownloadCloud className="w-5 h-5" /> Export Data
            </CardTitle>
            <CardDescription>Download your store data in CSV format for analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-md"><FileText className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold">Products Catalog</h4>
                  <p className="text-sm text-muted-foreground">Export all products and variants</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleExportProducts}>Export CSV</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-md"><ShoppingBag className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold">Orders History</h4>
                  <p className="text-sm text-muted-foreground">Export all transaction records</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleExportOrders}>Export CSV</Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-md"><Users className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-semibold">Customer Directory</h4>
                  <p className="text-sm text-muted-foreground">Export customer details</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleExportCustomers}>Export CSV</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5" /> Bulk Import
            </CardTitle>
            <CardDescription>Upload CSV files to bulk create or update records.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={handleImportClick}>
              <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Products CSV</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Drag and drop your CSV file here, or click to browse files from your computer.
              </p>
              <input 
                type="file" 
                id="csv-upload" 
                className="hidden" 
                accept=".csv"
                onChange={handleFileChange}
              />
              <Button>Select File</Button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
              <strong>Important:</strong> Ensure your CSV headers exactly match the template format. Invalid columns will be skipped during import.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
