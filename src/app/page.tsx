"use server";
// app/chat/page.tsx (Server Component)
import ChatApp from "@/components/chatContent/ChatApp";
import { cookies } from "next/headers";

export default async function Page() {
  const token = (await cookies()).get("authToken")?.value || "";

  // Kiểm tra token hợp lệ trước khi render ChatApp
  if (token == "") {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>Please log in to access the chat</h1>
        <a href="/login">Go to Login</a>
      </div>
    );
  }

  // console.log("Token:", token);

  return (
      <ChatApp token={token} />
  );
}