"use client";

import { useState, useEffect } from "react";
import { Review } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ReviewService } from "@/services/review.service";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { profile } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await ReviewService.getReviewsByProduct(productId);
        setReviews(data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast.error("You must be logged in to leave a review.");
      return;
    }
    
    if (comment.trim().length < 10) {
      toast.error("Review must be at least 10 characters long.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newReview: Review = {
        id: `r_${Date.now()}`,
        productId,
        userId: profile.uid,
        userName: profile.name,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };
      
      setReviews(prev => [newReview, ...prev]);
      setComment("");
      setRating(5);
      toast.success("Review submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  // Calculate rating breakdown
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating as keyof typeof ratingCounts]++;
    }
  });

  return (
    <section className="mt-16 pt-8 border-t" id="reviews">
      <div className="flex flex-col md:flex-row mb-12 gap-12">
        {/* Rating Overview */}
        <div className="md:w-1/3">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Customer Reviews</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl font-bold tracking-tighter">{averageRating.toFixed(1)}</div>
            <div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-5 h-5 ${star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} 
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Based on {reviews.length} reviews</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star as keyof typeof ratingCounts];
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <div className="w-12 text-muted-foreground flex items-center gap-1">
                    {star} <Star className="w-3 h-3 fill-current" />
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-muted-foreground">{percentage.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Review Form */}
        <div className="md:col-span-1">
          <div className="bg-muted/30 p-6 rounded-xl border">
            <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
            {profile ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star 
                          className={`w-6 h-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted hover:text-yellow-200"}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium mb-2">Your Review</label>
                  <Textarea
                    id="comment"
                    placeholder="What did you like or dislike?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="mb-4">You need to log in to write a review.</p>
                <Button asChild variant="outline">
                  <a href="/login">Log In to Review</a>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-xl bg-muted/10">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">{review.userName}</span>
                    <span className="text-xs text-muted-foreground ml-3">
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
