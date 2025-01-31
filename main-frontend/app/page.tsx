"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Shirt as TShirt, Ticket, Truck, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";

const HomePage = () => {
  // Sample data
  const featuredProducts = [
    {
      id: 1,
      name: "Attack on Titan Survey Corps Jacket",
      price: 59.99,
      image: "/aot-jacket.jpg",
      category: "Jackets",
    },
    {
      id: 2,
      name: "Demon Slayer Kimetsu Hoodie",
      price: 49.99,
      image: "/demon-slayer-hoodie.jpg",
      category: "Hoodies",
    },
    {
      id: 3,
      name: "Naruto Uzumaki Orange T-Shirt",
      price: 29.99,
      image: "/naruto-tshirt.jpg",
      category: "T-Shirts",
    },
    {
      id: 4,
      name: "My Hero Academia All Might Sweatshirt",
      price: 54.99,
      image: "/mha-sweatshirt.jpg",
      category: "Sweatshirts",
    },
  ];

  const categories = [
    { name: "T-Shirts", icon: <TShirt className="h-8 w-8" />, count: 128 },
    { name: "Hoodies", icon: <Zap className="h-8 w-8" />, count: 45 },
    { name: "Jackets", icon: <Truck className="h-8 w-8" />, count: 32 },
    { name: "Accessories", icon: <Ticket className="h-8 w-8" />, count: 67 },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-900 to-blue-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">
            Wear Your Anime Passion
          </h1>
          <p className="text-xl mb-8 text-zinc-200">
            Premium Quality Anime Apparel for True Fans
          </p>
          <Button
            size="lg"
            className="bg-red-500 hover:bg-red-600 text-lg px-8 py-6 rounded-full"
          >
            Explore Collection
          </Button>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Shop By Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-purple-600 mb-4">{category.icon}</div>
              <h3 className="text-xl font-bold mb-2">{category.name}</h3>
              <p className="text-zinc-500">{category.count}+ items</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-zinc-100 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Trending Now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
              >
                <div className="relative h-80">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button className="bg-white text-black hover:bg-zinc-100">
                      Quick View
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <span className="text-sm text-zinc-500">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-xl font-bold text-purple-600">
                    ${product.price}
                  </p>
                  <Button className="w-full mt-4 group-hover:bg-purple-600 group-hover:text-white">
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-zinc-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Get 15% Off Your First Order!
          </h2>
          <p className="text-zinc-300 mb-8">
            Join our newsletter for exclusive deals and anime merch updates
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white/10 border-none text-white placeholder-zinc-400"
            />
            <Button className="bg-purple-600 hover:bg-purple-700">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;