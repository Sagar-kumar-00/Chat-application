"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMyContext } from "../MyContext";
import axios from "axios";
import { Api_URL } from "../utils/util";
import { ToastContainer, toast } from "react-toastify";

const RightChats = () => {
  const {
    user,
    chatId,
    soloMsgs,
    setSoloMsgs,
    socket,
    activeChatUsers,
    chats,
    notifications,
    setNotifications,
  } = useMyContext();
  const inputRef = useRef(null);

  const [newMessageRecieved, setNewMessageRecieved] = useState(null);

  const notify = () => toast("Wow so easy!");

  const config = {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${
        typeof window !== "undefined" && localStorage.getItem("token")
      }`,
    },
  };

  const fetchAllChatMessages = async () => {
    // setChatId(chatId);
    const data = await axios
      .get(`${Api_URL}/message/fetchMessage/${chatId}`, config)
      .then((e) => {
        setSoloMsgs(e.data);
      });
  };

  const setActive = (index) => {
    const activeDiv = document.getElementById(`ActiveMessage_${index}`);
    activeDiv?.scrollIntoView({
      block: "end",
      behavior: "smooth",
      inline: "nearest",
    });
  };
  useEffect(() => {
    if (chatId) {
      console.log('triggered')
      fetchAllChatMessages();
    }
  }, [chatId]);

  useEffect(() => {
    if (soloMsgs && soloMsgs.length > 0) {
      setActive(soloMsgs.length - 1);
    }
  }, [soloMsgs.length]);

  const sendSingleMessage = async (e) => {
    e.preventDefault();
    if (inputRef.current.value !== "") {
      const data = await axios.post(
        `${Api_URL}/message/sendMessage`,
        { content: inputRef.current.value, chatId: chatId },
        config
      );
      socket.emit("new message", data.data);
      console.log('check2222')
      setSoloMsgs([...soloMsgs, data.data]);
      inputRef.current.value = "";
    } else {
      notify();
    }
  };
  console.log(chatId, "ooooooooooooooo", notifications);
  useEffect(() => {
    socket &&
      socket.on("message recieved", (newMessageRecieved) => {
        if (
          !chatId || // if chat is not selected or doesn't match current chat
          chatId !== newMessageRecieved.chat._id
        ) {
          // if (!notification.includes(newMessageRecieved)) {
          //   setNotification([newMessageRecieved, ...notification]);
          //   setFetchAgain(!fetchAgain);
          // }
          // props.fetchChats();
          // fetchChats();
          console.log("nnnmee", newMessageRecieved);
          setNotifications([...notifications, newMessageRecieved]);
        } else {
          console.log("mmm");
          setSoloMsgs([...soloMsgs, newMessageRecieved]);
        }
      });
  });

  // useEffect(() => {
  //   socket &&
  //     socket.on("message delete2", (newMessageRecieved) => {
  //       // setNewMessageRecieved(newMessageRecieved);
  //       if (
  //         !chatId || // if chat is not selected or doesn't match current chat
  //         chatId !== newMessageRecieved.chat
  //       ) {
  //         // if (!notification.includes(newMessageRecieved)) {
  //         //   setNotification([newMessageRecieved, ...notification]);
  //         //   setFetchAgain(!fetchAgain);
  //         // }
  //         // props.fetchChats();
  //         // fetchChats();
  //         console.log('here')
  //       } else {
  //         console.log('hereeeeeeeeeeeee')
  //         let temp = [...soloMsgs];
  //         let result = temp.filter(
  //           (ele, ind) => ele._id !== newMessageRecieved._id
  //         );
  //         setSoloMsgs(result);
  //       }
  //     });
  // });

  const handleDeleteMessage = async (id, index) => {
    const { data } = await axios.post(
      `${Api_URL}/message/deleteMessage`,
      { messageId: id },
      config
    );
    socket.emit("message delete", {
      data: data.data,
      chatIds: activeChatUsers,
    });

    let temp = [...soloMsgs];
    let result = temp.filter((ele, ind) => ind !== index);
    setSoloMsgs(result);
    // setSoloMsgs([...soloMsgs, data.data]);
  };
  return (
    <>
      <div className="chat-messages-container">
        <div className="messages-area">
          {chats && !chats.length && (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <h3>No Chats Yet</h3>
              <p>Start a new conversation to begin chatting</p>
            </div>
          )}
          {chatId && (
            <>
              {soloMsgs && soloMsgs.length > 0 ? (
                soloMsgs.map((ele, ind) => {
                  return (
                    <div id={`ActiveMessage_${ind}`} key={ind}>
                      {ele.sender._id === user._id ? (
                        <div className="message-sent">
                          <div className="message-bubble sent">
                            <p>{ele.content}</p>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteMessage(ele._id, ind)}
                              title="Delete message"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="message-received">
                          <img
                            className="message-avatar"
                            src={`${Api_URL}/uploads/${ele.sender.pic}`}
                            alt={ele.sender.name}
                          />
                          <div className="message-bubble received">
                            <p>{ele.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="empty-chat">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <p>Start your conversation</p>
                </div>
              )}
            </>
          )}
        </div>
        {chatId && (
          <div className="message-input-container">
            <form onSubmit={sendSingleMessage} className="message-form">
              <input
                className="message-input"
                placeholder="Type a message..."
                ref={inputRef}
              />
              <button type="submit" className="send-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default RightChats;
