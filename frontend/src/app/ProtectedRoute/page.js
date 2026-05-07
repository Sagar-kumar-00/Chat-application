"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Signup from "../signup/page";

const Protected = (WrappedComponent) => {
  const Authenticate = (props) => {
    const router = useRouter();

    // Simulated authentication check
    const isAuthenticated = () => {
      let token = true;
      if (typeof window !== "undefined" && localStorage.getItem("token")) {
        token = true;
      }
      return token;
    };
    useEffect(() => {
      if (!isAuthenticated()) {
        router.push("/");
      }
    }, [isAuthenticated, router]);

    // Render the wrapped component if authenticated, or null otherwise
    return isAuthenticated ? <WrappedComponent {...props} /> : <Signup />;
  };

  return Authenticate;
};

export default Protected;
