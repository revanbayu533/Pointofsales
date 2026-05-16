"use client";

import { useRouter } from "next/navigation";
import LandingPage from "@/pages/LandingPage";

export default function Home() {
  const router = useRouter();

  const handleEnter = () => {
    router.push("/dashboard");
  };

  return <LandingPage onEnter={handleEnter} />;
}
