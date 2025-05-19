"use server";
import CallApp from "@/components/callContent/CallApp";
import { cookies } from "next/headers";
import React, { use } from "react";

interface CallPageProps {
  params: Promise<{ roomId: string }>;
  searchParams?: Promise<{ userPhone: string }>;
}

const CallPage: React.FC<CallPageProps> = async (context) => {
  const token = (await cookies()).get("authToken")?.value || "";
  const preUserPhone = await context.searchParams;
  const preRoomId = await context.params;
  // isInitiaor lấy trong query params
  // const isInitiator = q?.isInitiator || false;
  const roomId = decodeURIComponent(preRoomId.roomId); // Lấy roomId từ params
  const userPhone = decodeURIComponent(preUserPhone?.userPhone || ""); // Lấy userPhone từ query params
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

  return <CallApp roomId={roomId} token={token} userPhone={userPhone} />;
};

export default CallPage;
