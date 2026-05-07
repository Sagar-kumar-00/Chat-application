"use client";
import React, { useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useMyContext } from "../MyContext";
import axios from "axios";
import { Api_URL } from "../utils/util";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  let inputRef = useRef(null);
  const handleShow = () => setShow(true);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupIds, setGroupIds] = useState([]);
  const handleClose = () => {
    setShow(false);
    setIsGroupChat(false);
    setGroupIds([]);
  };
  const handleNewChat = () => {
    handleShow();
  };

  const {
    setChatId,
    user,
    socket,
    chats,
    setChats,
    allUsers,
    setAllUsers,
    notifications,
  } = useMyContext();

  const config = {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${
        typeof window !== "undefined" && localStorage.getItem("token")
      }`,
    },
  };

  const fetchAllUsers = async () => {
    try {
      const { data } = await axios.post(
        `${Api_URL}/mainchat/getUser`,
        {},
        config
      );
      if (data) {
        setAllUsers(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const createNewChat = async (id) => {
    try {
      const { data } = await axios.post(
        `${Api_URL}/mainchat/createChat`,
        { userId: id },
        config
      );
      if (data.success === false) {
        // success false means chat already exists
        setChatId(data.data._id);

        setShow(false);
        return;
      }
      socket.emit("chat create", id);
      setChats([...chats, data]);
      setShow(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleNewGroupChat = () => {
    setIsGroupChat(true);
    handleShow();
  };

  const createNewGroupChat = async () => {
    try {
      const { data } = await axios.post(
        `${Api_URL}/mainchat/createGroupChat`,
        { name: inputRef.current.value, users: JSON.stringify(groupIds) },
        config
      );
      if (data) {
        setChats([...chats, data]);
        setShow(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    
    // Disconnect socket if exists
    if (socket) {
      socket.disconnect();
    }
    
    // Redirect to login page
    router.push("/login");
  };

  return (
    <div className="chat-header">
      <div className="header-left">
        <h1 className="app-title">Chat App</h1>
        {user && <p className="user-greeting">Welcome, {user.name}!</p>}
      </div>
      
      <div className="header-actions">
        <button
          className="header-btn primary"
          onClick={handleNewChat}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          New Chat
        </button>
        <button
          className="header-btn secondary"
          onClick={handleNewGroupChat}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          New Group
        </button>
        <button
          className="header-btn logout"
          onClick={handleLogout}
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>

      <Modal show={show} onHide={handleClose} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>{isGroupChat ? 'Create Group Chat' : 'Start New Chat'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="users-list">
            {allUsers &&
              allUsers.map((e, ind) => {
                return (
                  <div key={e._id} className="user-item">
                    {!isGroupChat ? (
                      <div
                        className="user-card"
                        onClick={() => createNewChat(e._id)}
                      >
                        <img
                          src={`${Api_URL}/uploads/${e.pic}`}
                          alt={e.name}
                          className="user-avatar-small"
                        />
                        <span className="user-name">{e.name}</span>
                      </div>
                    ) : (
                      <div className="user-checkbox">
                        <input
                          type="checkbox"
                          id={`user-${e._id}`}
                          name={e.name}
                          value={e._id}
                          onChange={() => {
                            if (!groupIds.includes(e._id)) {
                              setGroupIds([...groupIds, e._id]);
                            } else {
                              let temp = [...groupIds];
                              let res = temp.filter((ele) => ele !== e._id);
                              setGroupIds(res);
                            }
                          }}
                        />
                        <label htmlFor={`user-${e._id}`} className="checkbox-label">
                          <img
                            src={`${Api_URL}/uploads/${e.pic}`}
                            alt={e.name}
                            className="user-avatar-small"
                          />
                          {e.name}
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
          {isGroupChat && (
            <div className="group-creation">
              <input
                ref={inputRef}
                placeholder="Enter group name"
                className="group-name-input"
              />
              <button onClick={createNewGroupChat} className="create-group-btn">
                Create Group
              </button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Header;
