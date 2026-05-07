"use client";
import React, { useCallback, useEffect, memo, useState } from "react";
import { useMyContext } from "../MyContext";
import axios from "axios";
import { Api_URL } from "../utils/util";
import { BsCircleFill } from "react-icons/bs";

const LeftChats = ({ onChatSelect }) => {
  const {
    chats,
    setChats,
    user,
    chatId,
    setChatId,
    activeChatUsers,
    setActiveChatUsers,
    socket,
    notifications,
    setNotifications,
  } = useMyContext();

  const [newUserJoined, setNewUserJoined] = useState(null);

  const config = {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${
        typeof window !== "undefined" && localStorage.getItem("token")
      }`,
    },
  };

  // Mark messages as read in backend
  const markChatAsRead = async (chatId) => {
    try {
      await axios.post(
        `${Api_URL}/message/markAsRead`,
        { chatId },
        config
      );
      console.log(`Marked chat ${chatId} as read in backend`);
    } catch (error) {
      console.error("Error marking chat as read:", error);
    }
  };

  const fetchChats = useCallback(async () => {
    try {
      const { data } = await axios.post(
        `${Api_URL}/mainchat/fetchChats`,
        {},
        config
      );
      if (data) {
        setChats(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    socket &&
      socket.on("newuser joined", (data) => {
        if (data.userId === user._id) {
          fetchChats();
        }
      });

    if (newUserJoined !== null) {
      fetchChats();
    }
  });

  return (
    <>
      <div className="chat-list-container">
        <div className="chat-list-header">
          <h2>Messages</h2>
        </div>
        <div className="chat-list">
          {chats &&
            chats.map((e, ind) => {
              return (
                <div
                  className={`chat-item ${e._id === chatId ? "active" : ""}`}
                  onClick={async () => {
                    if (chatId) {
                      socket.emit("leave chat", chatId);
                    }
                    setChatId(e._id);
                    socket.emit("join chat", e._id);
                    let data = e.users.map((ele) => ele._id);
                    setActiveChatUsers(data);
                    
                    // Mark messages as read in backend
                    await markChatAsRead(e._id);
                    
                    // Clear notifications for this chat in frontend
                    const filteredNotifications = notifications.filter(
                      (notif) => notif.chat._id !== e._id
                    );
                    setNotifications(filteredNotifications);
                    
                    // Call onChatSelect to close sidebar on mobile
                    if (onChatSelect) {
                      onChatSelect();
                    }
                  }}
                  key={ind}
                >
                  {/* Show notification count for this chat (only if not currently open) */}
                  {e._id !== chatId && notifications.filter((notif) => notif.chat._id === e._id).length > 0 && (
                    <span className="chat-notification-badge">
                      {notifications.filter((notif) => notif.chat._id === e._id).length}
                    </span>
                  )}
                  
                  {e.isGroupChat && (
                    <div className="chat-item-content">
                      <img
                        className="chat-avatar"
                        src={e.groupPic}
                        alt={e.chatName}
                      />
                      <div className="chat-info">
                        <h4>{e.chatName}</h4>
                      </div>
                    </div>
                  )}
                  {e.users.map((ele) => {
                    if (ele.email !== user?.email && !e.isGroupChat) {
                      return (
                        <div className="chat-item-content" key={Math.random()}>
                          <img
                            className="chat-avatar"
                            src={`${Api_URL}/uploads/${ele.pic}`}
                            alt={ele.name}
                          />
                          <div className="chat-info">
                            <h4>{ele.name}</h4>
                            <div className="status-indicator">
                              <span
                                className={`status-dot ${
                                  ele.isOnline ? "online" : "offline"
                                }`}
                              ></span>
                              <span className="status-text">
                                {ele.isOnline ? "Online" : "Offline"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default LeftChats;
