"use client";
import LeftChats from "../LeftChats/page";
import RightChats from "../RightChats/page";
import Header from "../Header/page";
import Protected from "../ProtectedRoute/page";
import { useMyContext } from "../MyContext";
import Loader from "../utils/Loader";
import { useState } from "react";

const HOME = () => {
  const { user, chatId, setChatId, chats } = useMyContext();

  // Get current chat details for mobile header
  const getCurrentChat = () => {
    if (!chatId || !chats) return null;
    return chats.find(chat => chat._id === chatId);
  };

  const currentChat = getCurrentChat();
  const getChatName = () => {
    if (!currentChat) return "";
    if (currentChat.isGroupChat) return currentChat.chatName;
    const otherUser = currentChat.users.find(u => u.email !== user?.email);
    return otherUser?.name || "";
  };

  const getChatAvatar = () => {
    if (!currentChat) return "";
    if (currentChat.isGroupChat) return currentChat.groupPic;
    const otherUser = currentChat.users.find(u => u.email !== user?.email);
    return otherUser?.pic || "";
  };

  const handleBackToChats = () => {
    setChatId(null);
  };

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <Header />
        
        <div className="chat-container">
          <div className="chat-layout">
            {/* Chat List - Hide on mobile when chat is open */}
            <div className={`chat-sidebar ${chatId ? 'hide-on-mobile' : ''}`}>
              <LeftChats />
            </div>

            {/* Chat View - Hide on mobile when no chat is open */}
            <div className={`chat-main ${!chatId ? 'hide-on-mobile' : ''}`}>
              {chatId && (
                <div className="mobile-chat-header">
                  <button 
                    className="mobile-back-btn"
                    onClick={handleBackToChats}
                    aria-label="Back to chat list"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  </button>
                  <div className="mobile-chat-info">
                    <img 
                      src={`https://chat-yvhx.onrender.com/uploads/${getChatAvatar()}`} 
                      alt={getChatName()}
                      className="mobile-chat-avatar"
                    />
                    <h3 className="mobile-chat-name">{getChatName()}</h3>
                  </div>
                </div>
              )}
              <RightChats />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Protected(HOME);
