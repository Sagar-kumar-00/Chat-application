"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Api_URL } from "../utils/util";
import { toast } from "react-toastify";
import Loader from "../utils/Loader";
import { useMyContext } from "../MyContext";



const Signup = ({user}) => {
  const [email, setEmail] = useState(user ? user.email : "");
  const [uploadedImage, setUploadedImage] = useState(
    "/default-avatar.png"
  );
  const [postImage, setPostImage] = useState(null);
  const [password, setPassword] = useState("");
  const [name, setName] = useState(user ? user.name : "");
  const router = useRouter();
  const {loading,setLoading } = useMyContext();

  useEffect(() => {
    // Check if user is already logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const loggedUser = typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;
    
    if (token && loggedUser) {
      console.log("✅ User already logged in, redirecting to home");
      router.push("/home");
    }
  }, [router]);

  useEffect(()=>{

    return (()=>{
      setLoading(false)
    })
  },[])


  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (email && name && password) {
      const formData = new FormData();
      if (postImage) {
        formData.append("pic", postImage);
      }
      formData.append("email", email);
      formData.append("password", password);
      formData.append("name", name);
      setLoading(true)
      const data = await axios
        .post(`${Api_URL}/chat/createUser`, formData, config)

        .then((ele) => {
          console.log(ele,'aaaaaaaaee')
          if(!ele.data.success){
            
            toast.error(ele.data.message)
            setLoading(false)
            return
          }
          router.push("/login");
        });
    }else{
      toast.info('Please fill all fields')
    }
  }

  function imageChange(event) {
    const file = event.target.files[0];
    const imageURL = URL.createObjectURL(file);
    setPostImage(file);
    setUploadedImage(imageURL);
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2>{!user ? 'Create Account' : 'Update Profile'}</h2>
          <p className="signup-subtitle">{!user ? 'Join us and start chatting!' : 'Update your profile information'}</p>
        </div>
        
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="profile-upload-section">
            <div className="profile-image-wrapper">
              <img src={uploadedImage} alt="Profile" className="profile-preview" />
              <label htmlFor="file-upload" className="upload-overlay">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  fill="white"
                >
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3.2-5c0 1.77 1.43 3.2 3.2 3.2s3.2-1.43 3.2-3.2-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2z"/>
                </svg>
                <span>Change</span>
              </label>
            </div>
            <input
              id="file-upload"
              className="file-input-hidden"
              type="file"
              accept="image/*"
              onChange={(e) => imageChange(e)}
            />
            <p className="upload-hint">Profile picture is optional</p>
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">Username</label>
            <input
              id="name"
              value={name}
              className="form-input"
              placeholder="Enter your username"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              value={email}
              className="form-input"
              placeholder="Enter your email"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="signup-button">
            {!user ? 'Sign Up' : 'Update Profile'}
          </button>

          {!user && (
            <div className="signup-footer">
              <p>Already have an account? 
                <Link href="/login" className="login-link">
                  Login
                </Link>
              </p>
            </div>
          )}
        </form>
      </div>
      {loading && <Loader />}
    </div>
  );
};

export default Signup;
