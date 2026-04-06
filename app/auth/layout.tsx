"use client";

import { Logo } from "@/components/logo";
import GridShape from "@/components/grid-shape";
import { PublicRoute } from "@/components/PublicRoute";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PublicRoute>
      <div className="flex h-screen">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          {children}
        </div>
        {/* Right side - Brand */}
        <div className="lg:w-1/2 w-full h-full bg-slate-600 lg:grid items-center hidden">
          <div className="relative items-center justify-center  flex z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center ">
              <Logo size={200} color="#ffffff" />
              <h1 className="text-white text-4xl font-semibold">Neighbor Connector</h1>
              <p className="text-center text-gray-400 mt-2">
                Welcome to the Neighbor Connector Admin Panel. Please Sign in to Continue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
