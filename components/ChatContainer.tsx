"use client";

import React from "react";
import Image from "next/image";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";

const ChatContainer = ({
  selectedUser,
  onBack,
}: {
  selectedUser: any;
  onBack: () => void;
}) => {
  const { user } = useUser();
  const [input, setInput] = React.useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const [newMessages, setNewMessages] = React.useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  const messages = useQuery(
    api.messages.getMessages,
    user ? { senderId: user.id, receiverId: selectedUser.clerkId } : "skip",
  );

  // Fetch selected user in real time
  const freshSelectedUser = useQuery(api.users.getCurrentUser, {
    clerkId: selectedUser.clerkId,
  });

  // Send message mutation
  const sendMessage = useMutation(api.messages.sendMessage);

  // Typing indicator
  const setTyping = useMutation(api.users.setTyping);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll to bottom
  const handleScroll = () => {
    const el = chatRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    setIsAtBottom(atBottom);
    if (atBottom) {
      setNewMessages(false);
    } else {
      setNewMessages(true);
    }
  };

  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setNewMessages(false);
    } else {
      setNewMessages(true);
    }
  }, [messages, freshSelectedUser?.isTyping]);

  const handleMsg = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    // Set typing true
    setTyping({ clerkId: user!.id, isTyping: true });

    // Clear previous timeout
    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    // Set typing false after 2 seconds of inactivity
    typingTimeout.current = setTimeout(() => {
      setTyping({ clerkId: user!.id, isTyping: false });
    }, 2000);
  };
  const handleSubmit = async () => {
    if (!input.trim() || !user) return;
    await sendMessage({
      senderId: user.id,
      receiverId: selectedUser.clerkId,
      content: input,
    });
    setInput("");
    // Clear typing indicator
    setTyping({ clerkId: user.id, isTyping: false });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
  };

  const formatDateSeparator = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === now.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Mark messages as read when selectedUser or messages change
  const markAsRead = useMutation(api.messages.markAsRead);

  useEffect(() => {
    if (!user) return;
    markAsRead({
      senderId: selectedUser.clerkId,
      receiverId: user.id,
    });
  }, [selectedUser, messages]);

  return (
    <div className="h-full">
      <nav className="bg-white w-full md:w-3/4 fixed h-15 shadow-md z-50 py-5 px-3 md:px-10 flex justify-between items-center">
        <div className="user flex items-center gap-2">
          <button
            onClick={onBack}
            className="md:hidden mr-2 text-slate-800 hover:text-slate-950"
          >
            ←
          </button>
          <div className="relative">
            <img
              src={selectedUser.image}
              alt={selectedUser.name}
              width={30}
              height={30}
              className="rounded-full"
            />
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${freshSelectedUser?.isOnline ? "bg-green-500" : "bg-slate-400"}`}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-xl md:text-lg">{selectedUser.name}</span>
            <span className="text-xs text-gray-500">
              {freshSelectedUser?.isTyping ? (
                <span className="text-slate-500">typing...</span>
              ) : freshSelectedUser?.isOnline ? (
                <span className="text-green-600">Online</span>
              ) : (
                <span className="text-slate-400">Offline</span>
              )}
            </span>
          </div>
        </div>
        <div className="profile flex items-center gap-5">
          <p className=" font-semibold">
            <span className="md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
              {user?.firstName}
            </span>
          </p>
          <UserButton />
        </div>
      </nav>

      {/* Chat + input */}
      <div className="chat relative w-full h-full">
        {/* Messages */}
        <div
          ref={chatRef}
          onScroll={handleScroll}
          className="h-[90vh] w-full px-1 md:px-15 overflow-y-auto flex flex-col gap-3 pt-20"
        >
          {!messages && <p className="text-center mt-70">Loading...</p>}
          {messages?.map((msg, index) => {
            const showSeparator =
              index === 0 ||
              new Date(msg.createdAt).toDateString() !==
                new Date(messages[index - 1].createdAt).toDateString();
            return (
              <div key={msg._id}>
                {/* For today, tomorrow */}
                {showSeparator && (
                  <div className="flex items-center justify-center my-3">
                    <span className="bg-slate-100 text-xs text-gray-600 px-3 py-1 rounded-full">
                      {formatDateSeparator(msg.createdAt)}
                    </span>
                  </div>
                )}
                {/* For time */}
                <div
                  className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-xs text-sm text-semibold ${
                      msg.senderId === user?.id
                        ? "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white"
                        : "bg-white text-black shadow"
                    }`}
                  >
                    {msg.content}
                    <p className="text-xs mt-1 opacity-60 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {messages?.length === 0 && (
            <p className="text-center mt-70 text-gray-600">
              No messages yet. Say hi! 👋
            </p>
          )}
          {/* Typing indicator */}
          {freshSelectedUser?.isTyping && (
            <div className="flex justify-start">
              <div className="bg-white shadow px-4 py-2 rounded-2xl flex items-center gap-1">
                <div className="flex gap-1 ml-1">
                  <span
                    style={{ animationDelay: "0ms" }}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  />
                  <span
                    style={{ animationDelay: "150ms" }}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  />
                  <span
                    style={{ animationDelay: "300ms" }}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {newMessages && (
          <button
            onClick={() => {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
              setNewMessages(false);
              setIsAtBottom(true);
            }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-300 text-gray-800 text-xs px-4 py-2 rounded-full shadow-lg cursor-pointer"
          >
            ↓ New messages
          </button>
        )}
        {/* Input for msgs */}
        <div className="inputField absolute bottom-5 left-0 right-0 md:left-10 md:not-last:right-10 flex justify-between items-center h-12 rounded-xl bg-white shadow-lg border border-slate-300">
          {/* Chat Input */}
          <input
            onChange={handleMsg}
            onKeyDown={(e) => {
              e.key === "Enter" && handleSubmit();
            }}
            value={input}
            type="text"
            className="outline-none h-full w-full rounded-2xl px-4"
            placeholder="Type a message "
          />
          {/* Send Button */}
          <div className="send h-10 w-10 flex justify-center items-center rounded-full mr-3">
            <button
              onClick={handleSubmit}
              className="w-full h-full flex justify-center items-center rounded-full cursor-pointer bg-purple-200 hover:bg-purple-400"
            >
              <Image
                src="/send.png"
                alt="send icon"
                height={19}
                width={19}
              ></Image>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
