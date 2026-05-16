"use client";

import Dashboard from "@/pages/Dashboard";
import { useRouter } from "next/navigation";
import { PageType } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  
  const handleNavigate = (page: PageType) => {
    router.push(`/${page}`);
  };

  return <Dashboard onNavigate={handleNavigate} />;
}
