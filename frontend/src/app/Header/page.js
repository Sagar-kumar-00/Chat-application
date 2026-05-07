"use client";
import React, { useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useMyContext } from "../MyContext";
import axios from "axios";
import { Api_URL } from "../utils/util";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const Header = () => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  let inputRef = useRef(null);
  let friendEmailRef = useRef(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupIds, setGroupIds] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  
  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setIsGroupChat(false);
    setGroupIds([]);
  };
  const handleNewChat = () => {
    fetchFriends(); // Fetch friends when opening new chat
    handleShow();
  };

  const {
    setChatId,
    user,
    socket,
    chats,
    setChats,
  } = useMyContext();

  const config = {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${
        typeof window !== "undefined" && localStorage.getItem("token")
      }`,
    },
  };

  // Fetch friends list
  const fetchFriends = async () => {
    try {
      const { data } = await axios.get(`${Api_URL}/friend/list`, config);
      if (data.success) {
        setFriends(data.data);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  // Fetch friend requests
  const fetchFriendRequests = async () => {
    try {
      const { data } = await axios.get(`${Api_URL}/friend/requests`, config);
      if (data.success) {
        setFriendRequests(data.data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [user]);

  // Send friend request
  const handleSendFriendRequest = async () => {
    const email = friendEmailRef.current?.value;
    if (!email) {
      toast.error("Please enter an email");
      return;
    }

    try {
      const { data } = await axios.post(
        `${Api_URL}/friend/send`,
        { email },
        config
      );
      if (data.success) {
        toast.success(data.message);
        friendEmailRef.current.value = "";
        setShowAddFriend(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending request");
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (requestId) => {
    try {
      const { data } = await axios.post(
        `${Api_URL}/friend/accept`,
        { requestId },
        config
      );
      if (data.success) {
        toast.success("Friend request accepted!");
        fetchFriendRequests();
        fetchFriends();
      }
    } catch (error) {
      toast.error("Error accepting request");
    }
  };

  // Reject friend request
  const handleRejectRequest = async (requestId) => {
    try {
      const { data} = await axios.post(
        `${Api_URL}/friend/reject`,
        { requestId },
        config
      );
      if (data.success) {
        toast.success("Friend request rejected");
        fetchFriendRequests();
      }
    } catch (error) {
      toast.error("Error rejecting request");
    }
  };

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
          onClick={() => setShowAddFriend(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="17" y1="11" x2="23" y2="11"></line>
            <line x1="20" y1="8" x2="20" y2="14"></line>
          </svg>
          Add Friend
        </button>
        <button
          className="header-btn secondary friend-requests-btn"
          onClick={() => {
            setShowRequests(true);
            fetchFriendRequests();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M19 8v6m-3-3h6"></path>
          </svg>
          Requests
          {friendRequests.length > 0 && (
            <span className="friend-request-badge">{friendRequests.length}</span>
          )}
        </button>
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

      {/* Add Friend Modal */}
      <Modal show={showAddFriend} onHide={() => setShowAddFriend(false)} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Add Friend</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="add-friend-form">
            <p className="modal-description">Enter your friend's email to send a friend request</p>
            <input
              ref={friendEmailRef}
              type="email"
              placeholder="friend@example.com"
              className="friend-email-input"
            />
            <button onClick={handleSendFriendRequest} className="send-request-btn">
              Send Request
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Friend Requests Modal */}
      <Modal show={showRequests} onHide={() => setShowRequests(false)} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Friend Requests</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="friend-requests-list">
            {friendRequests.length === 0 ? (
              <p className="no-requests">No pending friend requests</p>
            ) : (
              friendRequests.map((request) => (
                <div key={request._id} className="friend-request-item">
                  <img
                    src={`${Api_URL}/uploads/${request.sender.pic}`}
                    alt={request.sender.name}
                    className="user-avatar-small"
                  />
                  <div className="request-info">
                    <p className="request-name">{request.sender.name}</p>
                    <p className="request-email">{request.sender.email}</p>
                  </div>
                  <div className="request-actions">
                    <button
                      onClick={() => handleAcceptRequest(request._id)}
                      className="accept-btn"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
                      className="reject-btn"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* New Chat Modal - Only show friends */}
      <Modal show={show} onHide={handleClose} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>{isGroupChat ? 'Create Group Chat' : 'Start New Chat'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="users-list">
            {friends && friends.length === 0 && !isGroupChat && (
              <p className="no-friends">No friends yet. Add friends to start chatting!</p>
            )}
            {friends &&
              friends.map((e, ind) => {
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
