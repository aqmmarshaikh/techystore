"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { StorageService } from "@/services/storage.service";
import { ProductService } from "@/services/product.service";

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  salePrice: z.coerce.number().optional(),
  categoryId: z.string().min(1, "Category is required"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  variants: z.array(z.any()).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      featured: false,
      isActive: true,
      categoryId: "electronics", // Default placeholder
      stock: 0,
      price: 0,
      variants: [],
    },
  });

  const featured = watch("featured");
  const isActive = watch("isActive");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload images to Firebase Storage
      const imageUrls = await Promise.all(
        imageFiles.map((file) => StorageService.uploadFile(file, "products"))
      );

      // 2. Save product to Firestore
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      await ProductService.createProduct({
        title: data.title,
        slug,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice,
        categoryId: data.categoryId,
        stock: data.stock,
        featured: data.featured,
        isActive: data.isActive,
        images: imageUrls,
        rating: 0,
        reviewsCount: 0,
        tags: [], // Could be added in UI later
        variants: data.variants || [],
      });

      toast.success("Product created successfully");
      router.push("/dashboard/products");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground mt-1">Create a new product listing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Product Title</Label>
                  <Input id="title" {...register("title")} placeholder="e.g. Premium Wireless Headphones" />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    {...register("description")} 
                    placeholder="Describe your product..." 
                    className="min-h-[150px]"
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Regular Price (₹)</Label>
                    <Input id="price" type="number" {...register("price")} placeholder="0" />
                    {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Sale Price (₹) [Optional]</Label>
                    <Input id="salePrice" type="number" {...register("salePrice")} placeholder="Leave empty for no sale" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border bg-muted">
                      <Image src={preview} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground font-medium">Add Image</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">Upload at least 1 image. Recommended size 800x800px.</p>
              </CardContent>
            </Card>

            {/* Product Variants */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Product Variants</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const newVariants = watch("variants") || [];
                      setValue("variants", [...newVariants, { id: Date.now().toString(), name: "", priceAdjustment: 0, stock: 0 }]);
                    }}
                  >
                    Add Variant
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Add options like size or color (optional).</p>
              </CardHeader>
              <CardContent>
                {(watch("variants") || []).map((variant: any, index: number) => (
                  <div key={variant.id} className="grid grid-cols-4 gap-4 mb-4 items-end border p-4 rounded-md">
                    <div className="space-y-2 col-span-2">
                      <Label>Variant Name (e.g., Large, Red)</Label>
                      <Input 
                        value={variant.name} 
                        onChange={(e) => {
                          const v = [...(watch("variants") || [])];
                          v[index].name = e.target.value;
                          setValue("variants", v);
                        }} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price Adj (+)</Label>
                      <Input 
                        type="number" 
                        value={variant.priceAdjustment} 
                        onChange={(e) => {
                          const v = [...(watch("variants") || [])];
                          v[index].priceAdjustment = Number(e.target.value);
                          setValue("variants", v);
                        }} 
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="text-destructive"
                      onClick={() => {
                        const v = [...(watch("variants") || [])];
                        v.splice(index, 1);
                        setValue("variants", v);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <select 
                    id="categoryId" 
                    {...register("categoryId")} 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="home">Home & Kitchen</option>
                    <option value="beauty">Beauty & Health</option>
                  </select>
                  {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock">Inventory Stock</Label>
                  <Input id="stock" type="number" {...register("stock")} placeholder="0" />
                  {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Active Status</Label>
                    <p className="text-sm text-muted-foreground">Hide or show this product</p>
                  </div>
                  <Switch 
                    id="isActive" 
                    checked={isActive} 
                    onCheckedChange={(val: boolean) => setValue("isActive", val)} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="featured">Featured Product</Label>
                    <p className="text-sm text-muted-foreground">Show on homepage</p>
                  </div>
                  <Switch 
                    id="featured" 
                    checked={featured} 
                    onCheckedChange={(val: boolean) => setValue("featured", val)} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
