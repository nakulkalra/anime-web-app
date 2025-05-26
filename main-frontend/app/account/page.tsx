"use client";

import { useSession } from "@/context/SessionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HeartIcon,
  ShoppingBagIcon,
  MapPinIcon,
  TagIcon,
  ShieldCheckIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Image from "next/image";

const FashionAccountPage = () => {
    const { session, setSession } = useSession();
    
  const router = useRouter();

  if (session === null) {
    // window.location.href = ("/Login");
    return null;
  }

  // Sample data for demonstration
  const orders = [
    {
      id: "1234",
      date: "2024-03-15",
      items: [
        { name: "Premium Denim Jacket", size: "M", color: "Blue", price: 129.99, image: "/denim-jacket.jpg" },
        { name: "Cotton Graphic Tee", size: "L", color: "Black", price: 39.99, image: "/graphic-tee.jpg" }
      ],
      status: "Delivered"
    }
  ];

  const addresses = [
    { name: "Home", details: "123 Fashion St...", isDefault: true }
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          
          {/* Fashion Account Navigation */}
          <Card className="border-zinc-200">
            <CardContent className="p-4 space-y-2">
              <nav className="space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-600 hover:bg-zinc-100">
                  <ShoppingBagIcon className="h-5 w-5" />
                  Order History
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-600 hover:bg-zinc-100">
                  <HeartIcon className="h-5 w-5" />
                  Wishlist
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-600 hover:bg-zinc-100">
                  <MapPinIcon className="h-5 w-5" />
                  Address Book
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-600 hover:bg-zinc-100">
                  <TagIcon className="h-5 w-5" />
                  Style Preferences
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-600 hover:bg-zinc-100">
                  <TicketIcon className="h-5 w-5" />
                  Loyalty Program
                </Button>
              </nav>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-100">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {/* <AvatarImage src={session.user.avatar} /> */}
                  <AvatarFallback className="bg-zinc-100 text-2xl">
                    session.user.name[0]

                    {/* {session.user.name[0]} */}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">Welcome back, {session.user.email.split('@')[0]}!</h1>
                  <p className="text-zinc-600">Member since 2022 • Style: Casual</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <Card className="border-zinc-200">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBagIcon className="h-6 w-6 text-zinc-700" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {orders.map((order) => (
                  <div key={order.id} className="border-b last:border-b-0 py-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-zinc-500">{order.date}</p>
                      </div>
                      <Badge variant={order.status === "Delivered" ? "outline" : "destructive"}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="rounded-lg border border-zinc-200"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-zinc-500">
                              {item.color} • Size {item.size}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${item.price}</p>
                            <Button variant="link" className="text-blue-600 h-auto p-0">
                              Buy Again
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Address Book */}
            <Card className="border-zinc-200">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MapPinIcon className="h-6 w-6 text-zinc-700" />
                  Saved Addresses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address, index) => (
                  <div key={index} className="border rounded-lg p-4 relative">
                    {address.isDefault && (
                      <Badge className="absolute -top-3 left-2 bg-green-600">Default</Badge>
                    )}
                    <h3 className="font-medium mb-2">{address.name}</h3>
                    <p className="text-zinc-600 text-sm">{address.details}</p>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Loyalty Program */}
            <Card className="border-zinc-200 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white">
              <CardHeader className="border-b border-zinc-700">
                <CardTitle className="flex items-center gap-2">
                  <TicketIcon className="h-6 w-6" />
                  Style Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold">1,250</span>
                      <span className="text-zinc-300">Points</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-2/3" />
                    </div>
                    <p className="text-sm text-zinc-300 mt-2">
                      Earn 250 more points to reach Gold Tier
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Available Rewards:</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                        $20 Off
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-600/20 text-purple-400">
                        Free Shipping
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FashionAccountPage;