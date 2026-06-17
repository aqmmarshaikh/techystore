import { useCartStore } from "../cartStore";
import { Product } from "@/types";

describe("Cart Store", () => {
  beforeEach(() => {
    // Reset the store before each test
    useCartStore.setState({ items: [] });
  });

  const mockProduct: Product = {
    id: "p1",
    title: "Test Product",
    price: 100,
    images: ["/test.jpg"],
    description: "Test description",
    categoryId: "c1",
    stock: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "test-product",
    rating: 0,
    reviewsCount: 0,
    featured: false,
    tags: []
  };

  it("should start with an empty cart", () => {
    expect(useCartStore.getState().items.length).toBe(0);
  });

  it("should add an item to the cart", () => {
    useCartStore.getState().addItem({
      id: "p1",
      productId: "p1",
      title: "Test Product",
      price: 100,
      image: "/test.jpg",
      quantity: 1,
      stock: 10
    });

    const state = useCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0].id).toBe("p1");
    expect(state.items[0].quantity).toBe(1);
  });

  it("should clear the cart", () => {
    useCartStore.getState().addItem({
      id: "p1",
      productId: "p1",
      title: "Test Product",
      price: 100,
      image: "/test.jpg",
      quantity: 1,
      stock: 10
    });

    expect(useCartStore.getState().items.length).toBe(1);
    
    useCartStore.getState().clearCart();
    
    expect(useCartStore.getState().items.length).toBe(0);
  });
});
