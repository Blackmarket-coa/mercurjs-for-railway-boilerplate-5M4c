/**
 * Mock data for product feed examples
 * This demonstrates the structure of products in the feed
 */

export const productFeedMock = [
  {
    id: "prod_1",
    handle: "organic-honey-wildflower",
    title: "Organic Wildflower Honey - 16oz",
    description: "Pure, raw wildflower honey harvested from our family apiary. Rich, complex flavor with notes of clover and lavender. Never heated, never filtered.",
    thumbnail: "/images/product/Image-1.jpg",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    variants: [
      {
        id: "variant_1",
        calculated_price: {
          calculated_amount: 2400,
          currency_code: "USD",
        },
      },
    ],
    categories: [
      { id: "cat_1", name: "Food & Produce", handle: "food-produce" },
      { id: "cat_2", name: "Honey & Sweeteners", handle: "honey-sweeteners" },
    ],
    seller: {
      id: "seller_1",
      name: "Sunrise Apiary",
      handle: "sunrise-apiary",
      photo: "/images/product/seller-avatar.jpg",
      verified: true,
      description: "Third-generation beekeepers producing pure, raw honey since 1978.",
    },
  },
  {
    id: "prod_2",
    handle: "handwoven-basket-natural",
    title: "Handwoven Storage Basket - Natural Fiber",
    description: "Beautifully crafted storage basket woven from sustainable palm leaves. Each piece is unique, made by skilled artisans using traditional techniques.",
    thumbnail: "/images/product/Image-2.jpg",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    variants: [
      {
        id: "variant_2",
        calculated_price: {
          calculated_amount: 4500,
          currency_code: "USD",
        },
      },
    ],
    categories: [
      { id: "cat_3", name: "Home & Living", handle: "home-living" },
      { id: "cat_4", name: "Handcrafted", handle: "handcrafted" },
    ],
    seller: {
      id: "seller_2",
      name: "Artisan Collective",
      handle: "artisan-collective",
      photo: "/images/product/seller-avatar.jpg",
      verified: true,
      description: "A cooperative of skilled artisans preserving traditional crafts.",
    },
  },
  {
    id: "prod_3",
    handle: "fresh-sourdough-bread",
    title: "Fresh Sourdough Bread - Whole Wheat",
    description: "Artisan sourdough made with organic whole wheat flour and our 50-year-old starter. Crusty exterior, soft tangy interior. Baked fresh daily.",
    thumbnail: "/images/product/Image-3.jpg",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    variants: [
      {
        id: "variant_3",
        calculated_price: {
          calculated_amount: 850,
          currency_code: "USD",
        },
      },
    ],
    categories: [
      { id: "cat_1", name: "Food & Produce", handle: "food-produce" },
      { id: "cat_5", name: "Bakery", handle: "bakery" },
    ],
    seller: {
      id: "seller_3",
      name: "Heritage Bakehouse",
      handle: "heritage-bakehouse",
      photo: "/images/product/seller-avatar.jpg",
      verified: true,
      description: "Small-batch bakery specializing in traditional sourdough breads.",
    },
  },
  {
    id: "prod_4",
    handle: "ceramic-coffee-mug",
    title: "Handmade Ceramic Coffee Mug - Ocean Blue",
    description: "Hand-thrown stoneware mug with a beautiful ocean blue glaze. Microwave and dishwasher safe. Holds 12oz of your favorite beverage.",
    thumbnail: "/images/product/Image-1.jpg",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    variants: [
      {
        id: "variant_4",
        calculated_price: {
          calculated_amount: 3200,
          currency_code: "USD",
        },
      },
    ],
    categories: [
      { id: "cat_3", name: "Home & Living", handle: "home-living" },
      { id: "cat_6", name: "Ceramics", handle: "ceramics" },
    ],
    seller: {
      id: "seller_4",
      name: "Clay & Fire Studio",
      handle: "clay-fire-studio",
      photo: "/images/product/seller-avatar.jpg",
      verified: false,
      description: "Contemporary ceramics inspired by nature and Japanese aesthetics.",
    },
  },
  {
    id: "prod_5",
    handle: "organic-vegetable-box",
    title: "Weekly Organic Vegetable Box",
    description: "A curated selection of seasonal organic vegetables, harvested fresh from our farm. Feeds a family of 4 for a week. Delivery available.",
    thumbnail: "/images/product/Image-2.jpg",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    variants: [
      {
        id: "variant_5",
        calculated_price: {
          calculated_amount: 4800,
          currency_code: "USD",
        },
      },
    ],
    categories: [
      { id: "cat_1", name: "Food & Produce", handle: "food-produce" },
      { id: "cat_7", name: "Fresh Vegetables", handle: "fresh-vegetables" },
    ],
    seller: {
      id: "seller_5",
      name: "Green Valley Farm",
      handle: "green-valley-farm",
      photo: "/images/product/seller-avatar.jpg",
      verified: true,
      description: "Certified organic family farm growing vegetables with love for 25 years.",
    },
  },
  {
    id: "prod_6",
    handle: "natural-soy-candle",
    title: "Hand-Poured Soy Candle - Lavender Fields",
    description: "All-natural soy wax candle scented with pure lavender essential oil. Clean burning with a cotton wick. 45+ hour burn time.",
    thumbnail: "/images/product/Image-3.jpg",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    variants: [
      {
        id: "variant_6",
        calculated_price: {
          calculated_amount: 2800,
          currency_code: "USD",
        },
      },
    ],
    categories: [
      { id: "cat_3", name: "Home & Living", handle: "home-living" },
      { id: "cat_8", name: "Candles & Fragrance", handle: "candles-fragrance" },
    ],
    seller: {
      id: "seller_6",
      name: "Meadow Light Co",
      handle: "meadow-light-co",
      photo: "/images/product/seller-avatar.jpg",
      verified: true,
      description: "Small-batch candles made with natural ingredients and love.",
    },
  },
  {
    id: "prod_7",
    handle: "digital-art-print",
    title: "Digital Art Print - Urban Sunset Collection",
    description: "High-resolution digital download. Perfect for home printing or professional print shops. Includes multiple sizes and formats.",
    thumbnail: "/images/product/Image-1.jpg",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    variants: [
      {
        id: "variant_7",
        calculated_price: {
          calculated_amount: 1500,
          currency_code: "USD",
        },
      },
    ],
    categories: [
      { id: "cat_9", name: "Digital Products", handle: "digital-products" },
      { id: "cat_10", name: "Art & Prints", handle: "art-prints" },
    ],
    seller: {
      id: "seller_7",
      name: "Pixel Dreams Art",
      handle: "pixel-dreams-art",
      photo: "/images/product/seller-avatar.jpg",
      verified: false,
      description: "Digital artist creating vibrant cityscapes and abstract compositions.",
    },
  },
  {
    id: "prod_8",
    handle: "local-hot-sauce",
    title: "Small Batch Hot Sauce - Smoky Habanero",
    description: "Handcrafted hot sauce made with locally grown habaneros and smoked peppers. Perfect balance of heat and flavor. 5oz bottle.",
    thumbnail: "/images/product/Image-2.jpg",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    variants: [
      {
        id: "variant_8",
        calculated_price: {
          calculated_amount: 1200,
          currency_code: "USD",
        },
      },
    ],
    categories: [
      { id: "cat_1", name: "Food & Produce", handle: "food-produce" },
      { id: "cat_11", name: "Condiments", handle: "condiments" },
    ],
    seller: {
      id: "seller_8",
      name: "Fire & Spice Kitchen",
      handle: "fire-spice-kitchen",
      photo: "/images/product/seller-avatar.jpg",
      verified: true,
      description: "Small-batch hot sauces and condiments made with local ingredients.",
    },
  },
]

/**
 * Get mock products with calculated prices formatted for display
 */
export function getMockFeedProducts() {
  return productFeedMock.map((product) => ({
    ...product,
    variants: product.variants.map((v) => ({
      ...v,
      calculated_price: {
        ...v.calculated_price,
        calculated_price: `$${(v.calculated_price.calculated_amount / 100).toFixed(2)}`,
        original_price: `$${(v.calculated_price.calculated_amount / 100).toFixed(2)}`,
      },
    })),
  }))
}
