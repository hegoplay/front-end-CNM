"use client";
import React, {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  use,
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
import { useUser } from "@/context/UserContext";
import { FindUserProvider } from "@/context/FindUserModelContext";
import '@ant-design/v5-patch-for-react-19';
// import { randomUUID } from "crypto";

const ChatApp: React.FC<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const  {userInfo} = useUser();

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
    unreadCounts
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
      router.push(`/call/${data.message}?userPhone=${userInfo?.phoneNumber}`); // Initiator
    }
  },[currentConversation, router]);


  console.log("Unread counts: ", unreadCounts);
  if (userInfo === null) {
    return 
      <div className="flex items-center justify-center h-full w-full">
        <Spin tip="Loading user info" size="large" />
      </div>;
  }
  
  return (
    <FindUserProvider>
      <ReactQueryProvider>
        <Navbar />
        <div className="chat-app">
          <div className="main-content">
            <div className="flex-1 flex-col h-full w-150 border-gray-300 border-1 overflow-auto">
              <SearchInfo />
              <div className="flex flex-col gap-2 border-t-1 overflow-y-auto scroll-smooth">
                {/* danh sách các cuộc hội thoại */}
                {conversations.map((conversation) => {
                  const unreadInfo = getConversationsWithUnreadCounts().find(
                    (c) => c.conversationId === conversation.id
                  );
                  return (
                    <ConversationBox
                      {...conversation}
                      key={conversation.id}
                      unreadCount={unreadCounts[conversation.id] || 0}
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
                    conversation={currentConversation}
                    pressCall={pressCall}
                  />
                </Suspense>
              ) : (
                <div className="flex flex-col h-full w-full justify-center align-center">
                  <span className="text-black text-center">Chọn đoạn hội thoại để nhắn tin</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </ReactQueryProvider>
    </FindUserProvider>
  );
};

export default ChatApp;
