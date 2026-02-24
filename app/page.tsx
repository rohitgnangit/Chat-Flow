"use client"

import Image from "next/image";
import { useState } from "react";
import { useUser } from "@clerk/nextjs"
import SideBar from "@/components/SideBar";
import ChatContainer from "@/components/ChatContainer";

export default function Home() {
  const [selectedUser, setSelectedUser] = useState(null)
  const { user } = useUser();
  return (
    <div className="flex w-full h-screen">
      <div className={`${selectedUser ? 'hidden md:block' : 'block'} w-full md:w-1/4`}>
        <SideBar selectedUser={selectedUser} setSelectedUser={setSelectedUser}/>
      </div>
        
        {selectedUser ? 
        <div className="w-full md:w-3/4">
          <ChatContainer selectedUser={selectedUser} onBack={() => setSelectedUser(null)}/>
        </div>
        :
        <div className="hidden md:block w-3/4 md:flex items-center justify-center flex-col gap-5">
          <Image src="/chat.png" alt="" width={200} height={200} />
          <p className="text-xl font-semibold">Select a user to start chatting 💬</p>
        </div>
        }
    </div>
  );
}
``