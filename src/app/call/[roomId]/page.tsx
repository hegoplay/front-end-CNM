"use server";
import CallApp from "@/components/callContent/CallApp";
import { cookies } from "next/headers";
import React from "react";

interface CallPageProps {
  params: {
    roomId: string;
    userPhone: string;
  },

}

const CallPage : React.FC<CallPageProps> = async (context) => {
  const token = (await cookies()).get("authToken")?.value || "";
  const temps = await context.params;
  // isInitiaor lấy trong query params
  // const isInitiator = q?.isInitiator || false;
  const roomId = decodeURIComponent(temps.roomId);
  const userPhone = decodeURIComponent(temps.userPhone); 
  // Kiểm tra token hợp lệ trước khi render ChatApp
  if (token == "") {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>Please log in to access the chat</h1>
        <a href="/login">Go to Login</a>
      </div>
    );
  }

  // Kiểm tra roomId hợp lệ
  if (!roomId || typeof roomId !== "string") {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>Invalid room ID</h1>
        <a href="/">Go to Chat</a>
      </div>
    );
  }
  // console.log("Token:", token);


  return <CallApp roomId={roomId} token={token} userPhone={userPhone}/>;
};

export default CallPage;
