"use client";

import React from "react";
import { useState } from "react";
import Image from "next/image";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import UnreadBadge from "./UnreadBadge";
import LastMessage from "./LastMessage";

const SideBar = ({ selectedUser, setSelectedUser }: { selectedUser: any, setSelectedUser: (user: any) => void }) => {
  // For Searching users
  const [search, setSearch] = useState("");

  const { user } = useUser();
  const currUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip",
  );
  // Fetching all users
  const allUsers = useQuery(api.users.getUsers);

  return (
    <div className="relative min-h-screen bg-slate-200 w-full py-5 px-2 md:px-5">
      <p className="text-2xl font-semibold">Chats</p>
      <div className="search flex rounded-xl shadow-lg mt-5 bg-white px-3 py-3">
        <Image src="/search.png" alt="Search" width={20} height={20} />
        <input
          onChange={(e) => setSearch(e.currentTarget.value)}
          type="text"
          className="ml-3 w-full text-sm outline-none"
          placeholder="search name"
        />
      </div>
      {!allUsers && <p className="text-center mt-20">Loading...</p>}

      {allUsers?.length === 0 && (
        <p className="text-center mt-20 text-slate-500">No users available</p>
      )}
      {/* If user not there while search */}
      <div className="names mt-10 bg-white rounded-xl shadow-lg">
        <ul>
          {allUsers?.filter(
            (u) =>
              u.clerkId !== user?.id &&
              u.name.toLowerCase().includes(search.toLowerCase()),
          ).length === 0 && (
            <p className="text-center text-sm text-slate-400 py-5">
              No matches found
            </p>
          )}
          {/* Filtering based on search */}
          {allUsers
            ?.filter(
              (u) =>
                u.clerkId !== user?.id &&
                u.name.toLowerCase().includes(search.toLowerCase()),
            )
            .map((u) => (
              <button
                onClick={() => setSelectedUser(u)}
                key={u._id}
                className={`w-full flex items-center gap-3 p-2 hover:bg-slate-300 cursor-pointer border-b border-slate-300 rounded-lg ${u._id === selectedUser?._id ? "bg-slate-300" : ""}`}
              >
                <div className="relative">
                  <img
                    src={u.image}
                    alt={u.name}
                    width={35}
                    height={35}
                    className="rounded-full"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${u.isOnline ? "bg-green-500" : "bg-slate-400"}`}
                  />
                </div>
                <div className="flex flex-col flex-1 text-left overflow-hidden">
                  <span className=" md:text-sm font-semibold">{u.name}</span>
                  <LastMessage otherUserId={u.clerkId} />
                </div>
                <UnreadBadge senderId={u.clerkId} receiverId={user?.id!} />
              </button>
            ))}
        </ul>
      </div>
      <div className="profile absolute bottom-10 flex items-center gap-5 ">
        <UserButton />
        <p className=" font-semibold">
          <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
            {user?.firstName}
          </span>
        </p>
      </div>
    </div>
  );
};

export default SideBar;
