"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const hasToken = Boolean(Cookies.get("authToken"));
    router.replace(hasToken ? "/dashboard" : "/auth/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
        <p className="text-lg text-gray-700">Redirecting...</p>
      </div>
    </div>
  );
}
