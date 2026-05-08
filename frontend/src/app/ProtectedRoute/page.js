"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMyContext } from "../MyContext";

const Protected = (WrappedComponent) => {
  const Authenticate = (props) => {
    const router = useRouter();
    const { user } = useMyContext();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      const checkAuth = () => {
        // Check if token exists and user is loaded
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const loggedUser = typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;
        
        if (!token || !loggedUser) {
          console.log("❌ No authentication found, redirecting to login");
          router.push("/login");
        } else {
          console.log("✅ User authenticated");
          setIsChecking(false);
        }
      };

      checkAuth();
    }, [router, user]);

    // Show nothing while checking authentication
    if (isChecking) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'rgb(37, 37, 38)',
          color: '#fff'
        }}>
          <div>Loading...</div>
        </div>
      );
    }

    // Render the wrapped component if authenticated
    return <WrappedComponent {...props} />;
  };

  return Authenticate;
};

export default Protected;
