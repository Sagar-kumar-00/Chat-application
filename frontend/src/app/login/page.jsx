"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMyContext } from "../MyContext";
import { Api_URL } from "../utils/util";
import { toast } from "react-toastify";
import Loader from "../utils/Loader";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setUser, loading, setLoading } = useMyContext();

  useEffect(() => {
    // Check if user is already logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const loggedUser = typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;
    
    if (token && loggedUser) {
      console.log("✅ User already logged in, redirecting to home");
      router.push("/home");
      return;
    }
  }, [router]);

  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  const config = {
    headers: {
      "Content-type": "application/json",
    },
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!email || !password) {
      toast.info('Please fill all fields');
      return;
    }
    
    // Test/Demo user - no backend authentication
    if (email === "dummy@gmail.com" && password === "dummy") {
      const dummyUser = {
        _id: "demo-user-123",
        name: "Demo User",
        email: "dummy@gmail.com",
        pic: "default-avatar.png",
        isAdmin: false,
        token: "demo-token-no-auth"
      };
      
      localStorage.setItem("token", dummyUser.token);
      localStorage.setItem("loggedUser", JSON.stringify(dummyUser));
      setUser(dummyUser);
      
      toast.success("Logged in as Demo User (Local Mode)");
      
      setTimeout(() => {
        router.push("/home");
      }, 100);
      return;
    }
    
    setLoading(true);
    const data = await axios
      .post(
        `${Api_URL}/chat/login`,
        { email: email, password: password },
        config
      )
      .then((e) => {
        if (!e.data.success) {
          setLoading(false);
          toast.error(e.data.message || "Login failed");
          return;
        } else {
          localStorage.setItem("token", e.data.data.token);
          localStorage.setItem("loggedUser", JSON.stringify(e.data.data));
          setUser(e.data.data);

          setTimeout(() => {
            router.push("/home");
          }, 100);
        }
      });
  }
  
  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to continue chatting</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                className="form-input"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                className="form-input"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-button">
              Login
            </button>

            <div className="demo-info">
              <p className="demo-text">
                <strong>Demo Mode:</strong> dummy@gmail.com / dummy
              </p>
            </div>

            <div className="login-footer">
              <p>
                Don't have an account?
                <Link href="/signup" className="signup-link">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      {loading && <Loader />}
    </>
  );
};

export default Login;
