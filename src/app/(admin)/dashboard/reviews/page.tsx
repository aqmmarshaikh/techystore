"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, ShieldCheck, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/config";

interface Review {
  id: string;
  productId: string;
  productName?: string;
  userName?: string;
  customerName?: string;
  rating: number;
  comment: string;
  createdAt: string;
  status?: "Pending" | "Approved" | "Hidden";
}

export default function ReviewsModerationPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedReviews: Review[] = [];
        snapshot.forEach((doc) => {
          fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
        });
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, status: "Approved" | "Hidden") => {
    try {
      await updateDoc(doc(db, "reviews", id), { status });
      setReviews(reviews.map(r => r.id === id ? { ...r, status } : r));
      toast.success(`Review ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredReviews = reviews.filter(r => 
    (r.productName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.comment || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.userName || r.customerName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Moderation</h1>
          <p className="text-muted-foreground mt-1">Approve, hide, and manage customer product reviews.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input 
            placeholder="Search reviews..." 
            className="pl-9 w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
            Loading reviews...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
            No reviews found.
          </div>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id} className={review.status === "Hidden" ? "opacity-75 bg-slate-50" : ""}>
              <CardContent className="p-6 flex flex-col sm:flex-row gap-6">
                {/* Left Side: Product & Rating */}
                <div className="sm:w-1/4 border-b sm:border-b-0 sm:border-r pb-4 sm:pb-0 sm:pr-6">
                  <p className="font-semibold text-sm line-clamp-1">{review.productName || "Unknown Product"}</p>
                  <p className="text-xs text-muted-foreground mt-1">By {review.userName || review.customerName || "Anonymous"}</p>
                  <div className="flex items-center gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                
                {/* Middle: Review Text */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {(!review.status || review.status === "Pending") && <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-0">Needs Review</Badge>}
                    {review.status === "Approved" && <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0"><ShieldCheck className="w-3 h-3 mr-1"/> Approved</Badge>}
                    {review.status === "Hidden" && <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 border-0"><EyeOff className="w-3 h-3 mr-1"/> Hidden</Badge>}
                  </div>
                  <p className="text-sm leading-relaxed">{review.comment}</p>
                </div>

                {/* Right Side: Actions */}
                <div className="sm:w-32 flex sm:flex-col justify-end sm:justify-start gap-2">
                  {review.status !== "Approved" && (
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(review.id, "Approved")}>
                      Approve
                    </Button>
                  )}
                  {review.status !== "Hidden" && (
                    <Button size="sm" variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleUpdateStatus(review.id, "Hidden")}>
                      Hide
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
