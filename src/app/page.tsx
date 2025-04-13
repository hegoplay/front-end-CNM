"use server";
// app/chat/page.tsx (Server Component)
import ChatApp from "@/components/chatContent/ChatApp";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { cookies } from "next/headers";

export default async function Page() {
  const token = (await cookies()).get("authToken")?.value || "";
  return (
    // <ReactQueryProvider>
      <ChatApp token={token} />
    // </ReactQueryProvider>
  );
}
