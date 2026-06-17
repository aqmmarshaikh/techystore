"use client";

import { useState, useEffect } from "react";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";
import { Product } from "@/types";
import { ProductService } from "@/services/product.service";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    } else {
      // Focus input when opened
      setTimeout(() => {
        document.getElementById("search-input")?.focus();
      }, 100);
    }
  }, [isOpen]);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length >= 2) {
        setIsLoading(true);
        try {
          // In a real app, use Algolia, Typesense, or Firebase Extensions for text search.
          // For now, we fetch all products and filter locally (Mock implementation)
          const allProducts = await ProductService.getProducts();
          
          const searchLower = debouncedQuery.toLowerCase();
          const filtered = allProducts.filter(p => 
            p.title.toLowerCase().includes(searchLower) || 
            p.description.toLowerCase().includes(searchLower) ||
            p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
          );
          
          // Add some mock data if DB is empty to demonstrate the UI
          if (allProducts.length === 0) {
            const mockData = [
              { id: "1", title: "Premium Wireless Headphones", price: 9999, images: ["/placeholder.jpg"] },
              { id: "2", title: "Minimalist Smartwatch", price: 8999, images: ["/placeholder.jpg"] }
            ] as any[];
            setResults(mockData.filter(p => p.title.toLowerCase().includes(searchLower)));
          } else {
            setResults(filtered.slice(0, 5)); // Show top 5
          }
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    };
    
    performSearch();
  }, [debouncedQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex justify-center pt-[10vh] sm:pt-[20vh] px-4">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-label="Close search"
      />
      
      <div className="relative w-full max-w-2xl bg-card border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 border-b">
          <SearchIcon className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            id="search-input"
            className="flex h-14 w-full bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 px-4"
            placeholder="Search products, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto p-2">
          {isLoading ? (
            <div className="py-12 flex justify-center items-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Searching...
            </div>
          ) : query.length < 2 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>Type at least 2 characters to search.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="text-sm px-3 py-1 bg-muted rounded-full cursor-pointer hover:bg-primary/10" onClick={() => setQuery("headphones")}>Headphones</span>
                <span className="text-sm px-3 py-1 bg-muted rounded-full cursor-pointer hover:bg-primary/10" onClick={() => setQuery("watch")}>Watch</span>
                <span className="text-sm px-3 py-1 bg-muted rounded-full cursor-pointer hover:bg-primary/10" onClick={() => setQuery("speaker")}>Speaker</span>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">Products</p>
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    router.push(`/products/${product.id}`);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 p-3 hover:bg-muted rounded-lg transition-colors text-left"
                >
                  <div className="relative w-12 h-12 bg-secondary rounded overflow-hidden shrink-0">
                    <Image 
                      src={product.images?.[0] || "/placeholder.jpg"} 
                      alt={product.title} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{product.title}</h4>
                    <p className="text-sm text-muted-foreground">₹{product.price.toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p>No results found for &quot;{query}&quot;.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
