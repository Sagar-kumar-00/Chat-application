"use client";
import LeftChats from "../LeftChats/page";
import RightChats from "../RightChats/page";
import Header from "../Header/page";
import Protected from "../ProtectedRoute/page";
import { useMyContext } from "../MyContext";
import Loader from "../utils/Loader";
import { useState } from "react";

const HOME = () => {
  const { user } = useMyContext();
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <Header />
        
        <div className="chat-container">
          {showSidebar && (
            <div 
              className="mobile-overlay" 
              onClick={() => setShowSidebar(false)}
            />
          )}
          <div className="chat-layout">
            <div className={`chat-sidebar ${showSidebar ? 'show' : 'hide'}`}>
              <LeftChats onChatSelect={() => {
                // Auto-close sidebar on mobile when chat is selected
                if (window.innerWidth <= 768) {
                  setShowSidebar(false);
                }
              }} />
            </div>
            <div className="chat-main">
              <button 
                className="mobile-toggle-btn"
                onClick={() => setShowSidebar(!showSidebar)}
                aria-label="Toggle chat list"
              >
                {showSidebar ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                )}
              </button>
              <RightChats />
            </div>
          </div>
        </div>
      </div>
      {!user && <Loader />}
    </div>
  );
};

export default Protected(HOME);
