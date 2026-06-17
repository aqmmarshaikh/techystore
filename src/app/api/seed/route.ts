import { NextResponse } from "next/server";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

const CATEGORIES = [
  { id: "electronics", name: "Electronics", description: "Smartphones, laptops, and premium audio devices.", isActive: true },
  { id: "fashion", name: "Fashion", description: "Trendy clothing and accessories for all occasions.", isActive: true },
  { id: "home", name: "Home & Living", description: "Minimalist decor, furniture, and kitchenware.", isActive: true },
];

const PRODUCTS = [
  {
    title: "Premium Wireless ANC Headphones",
    slug: "premium-wireless-anc-headphones",
    description: "Industry-leading noise cancellation and high-resolution audio playback. Experience up to 30 hours of battery life and plush ear cushions for all-day comfort.",
    price: 14999,
    salePrice: 12999,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
    categoryId: "electronics",
    stock: 45,
    rating: 4.8,
    reviewsCount: 124,
    featured: true,
    isActive: true,
    tags: ["audio", "wireless", "premium"],
  },
  {
    title: "Minimalist Smartwatch Series X",
    slug: "minimalist-smartwatch-series-x",
    description: "A sleek, edge-to-edge display smartwatch tracking your vitals, workouts, and sleep. Water-resistant up to 50 meters.",
    price: 8999,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"],
    categoryId: "electronics",
    stock: 22,
    rating: 4.5,
    reviewsCount: 89,
    featured: true,
    isActive: true,
    tags: ["wearable", "tech", "fitness"],
  },
  {
    title: "Organic Cotton Essential Tee",
    slug: "organic-cotton-essential-tee",
    description: "Your new favorite everyday t-shirt. Made from 100% organic, sustainably sourced cotton for unparalleled softness and breathability.",
    price: 1299,
    salePrice: 999,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"],
    categoryId: "fashion",
    stock: 150,
    rating: 4.3,
    reviewsCount: 256,
    featured: false,
    isActive: true,
    tags: ["clothing", "organic", "basics"],
  },
  {
    title: "Handcrafted Leather Messenger Bag",
    slug: "handcrafted-leather-messenger-bag",
    description: "Full-grain leather bag perfect for laptops up to 15 inches. Features multiple compartments and a comfortable adjustable shoulder strap.",
    price: 5499,
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80"],
    categoryId: "fashion",
    stock: 12,
    rating: 4.9,
    reviewsCount: 42,
    featured: true,
    isActive: true,
    tags: ["accessories", "leather", "premium"],
  },
  {
    title: "Matte Ceramic Coffee Mug Set",
    slug: "matte-ceramic-coffee-mug-set",
    description: "A set of four beautifully glazed, minimalist ceramic mugs. Microwave and dishwasher safe.",
    price: 1599,
    salePrice: 1299,
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80"],
    categoryId: "home",
    stock: 30,
    rating: 4.6,
    reviewsCount: 78,
    featured: false,
    isActive: true,
    tags: ["kitchen", "decor", "ceramic"],
  },
  {
    title: "Portable Waterproof Bluetooth Speaker",
    slug: "portable-waterproof-bluetooth-speaker",
    description: "Take your music anywhere with this rugged, IP67 waterproof speaker. Delivers 360-degree sound and powerful bass.",
    price: 3499,
    salePrice: 2999,
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80"],
    categoryId: "electronics",
    stock: 65,
    rating: 4.7,
    reviewsCount: 195,
    featured: true,
    isActive: true,
    tags: ["audio", "portable", "outdoor"],
  }
];

export async function GET() {
  try {
    // 1. Check if we already seeded to avoid duplicates
    const checkSnap = await getDocs(collection(db, "categories"));
    if (!checkSnap.empty) {
      return NextResponse.json({ message: "Database already contains categories. Skipping seed to prevent duplicates." }, { status: 200 });
    }

    let seededCount = 0;

    // 2. Seed Categories
    for (const cat of CATEGORIES) {
      const { id, ...data } = cat;
      await setDoc(doc(db, "categories", id), {
        ...data,
        createdAt: new Date().toISOString()
      });
    }

    // 3. Seed Products
    for (const prod of PRODUCTS) {
      // Create a unique doc reference to get auto-generated ID, or manually set it
      // Let's use standard addDoc behavior by setting to a new doc ref
      const newDocRef = doc(collection(db, "products"));
      await setDoc(newDocRef, {
        ...prod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      seededCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${CATEGORIES.length} categories and ${seededCount} products.` 
    });

  } catch (error: any) {
    console.error("Seeding Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
