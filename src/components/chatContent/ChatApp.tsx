"use client";
import React, {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import { Flex, Spin } from "antd";
import "./ChatApp.css";
import ConversationBox from "@/components/chatContent/conversationBox";
import ConversationDetailPage from "@/components/chatContent/conversationDetailPage";
import SearchInfo from "@/components/chatContent/search/searchInfo";
import Navbar from "@/components/navbar/Navbar";
import useSocket from "@/hooks/useSocket";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { useRouter } from "next/navigation";
import CallInvitation from "@/types/callInvitation";
// import { randomUUID } from "crypto";

const ChatApp: React.FC<{ token: string }> = ({ token }) => {
  const router = useRouter();

  console.log("Token client-side:", token);

  // Move useSocket hook to the top level, before any early returns
  const handleCallInvitation = useCallback(
    (data: CallInvitation | null) => {
      console.log("Call invitation data: ", data);
      if (!data?.conversationId) return;
      // router.push(`/call/${data.conversationId}?isInitiator=false`); // Participant
    },
    [router]
  );

  const handleCallError = useCallback((error: string | null) => {
    if (!error) return;
    alert(`Failed: ${error}`);
  }, []);

  const {
    conversations,
    currentConversation,
    getConversationsWithUnreadCounts,
    startCall,

    // isMounted
  } = useSocket(
    (process.env.NEXT_PUBLIC_SOCKET_URL as string) || "",
    token, // Pass null or handle token conditionally inside the hook
    {
      onCallInvitation: handleCallInvitation,
      onCallError: handleCallError,
    }
  );

  const pressCall =  useCallback( async () =>{
    console.log("Call button pressed");
    if (currentConversation) {
      const data = await startCall(currentConversation.id, "VIDEO");
      router.push(`/call/${data.message}?isInitiator=true`); // Initiator
    }
  },[currentConversation, router]);

  // console.log("Conversations: ", conversations);
  // Handle the case when token is not available

  // useLayoutEffect(() => {
  //   const cleanupMediaStreams = async () => {
  //     try {
  //       // Lấy tất cả các stream hiện tại
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         audio: true,
  //         video: true,
  //       });
  //       // Dừng tất cả các track
  //       stream.getTracks().forEach((track) => {
  //         track.stop();
  //         console.log(`Stopped media track: ${track.kind}`);
  //       });
  //     } catch (error) {
  //       console.log("No active media streams or permission denied:", error);
  //       // Không cần xử lý lỗi thêm vì đây chỉ là bước dọn dẹp dự phòng
  //     }
  //   };

  //   cleanupMediaStreams();
  // }, []);

  return (
    <ReactQueryProvider>
      <Navbar />
      <div className="chat-app">
        <div className="main-content">
          <div className="flex-1 flex-col h-full w-150 border-gray-300 border-1">
            <SearchInfo />
            <div className="flex flex-col gap-2 border-t-1 overflow-y-auto scroll-smooth">
              {conversations.map((conversation) => {
                const unreadInfo = getConversationsWithUnreadCounts().find(
                  (c) => c.conversationId === conversation.id
                );
                return (
                  <ConversationBox
                    {...conversation}
                    key={conversation.id}
                    unreadCount={unreadInfo?.unreadCount || 0}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex-3 h-full">
            {currentConversation ? (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full w-full">
                    <Spin tip="Loading" size="large" />
                  </div>
                }
              >
                <ConversationDetailPage
                  {...currentConversation}
                  pressCall={pressCall}
                />
              </Suspense>
            ) : (
              <div className="flex flex-col h-full w-full justify-center align-center">
                <span className="text-black text-center">PRO VJP</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ReactQueryProvider>
  );
};

export default ChatApp;
