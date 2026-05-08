"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Signup from "./signup/page";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const loggedUser = typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;
    
    if (token && loggedUser) {
      console.log("✅ User already logged in, redirecting to home");
      router.push("/home");
    }
  }, [router]);

  return (
    <>
      <Signup />
    </>
  );
};

export default Home;
