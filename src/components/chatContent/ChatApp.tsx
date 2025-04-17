"use client";
import React, { Suspense, useState, useEffect } from "react";
import { Flex, Spin } from "antd";
import "./ChatApp.css";
import ConversationBox from "@/components/chatContent/conversationBox";
import ConversationDetailPage from "@/components/chatContent/conversationDetailPage";
import SearchInfo from "@/components/chatContent/search/searchInfo";
import Navbar from "@/components/navbar/Navbar";
import useSocket from "@/hooks/useSocket";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";

const ChatApp: React.FC<{ token: string }> = ({ token }) => {
  const [isReady, setIsReady] = useState(false);

  // Move useSocket hook to the top level, before any early returns
  const {
    conversations,
    currentConversation,
    getConversationsWithUnreadCounts,
  } = useSocket(
    process.env.NEXT_PUBLIC_SOCKET_URL as string || "",
    isReady ? token : "" // Pass null or handle token conditionally inside the hook
  );

  useEffect(() => {
    if (token && process.env.NEXT_PUBLIC_SOCKET_URL) {
      setIsReady(true);
    }
  }, [token]);
  
  console.log("Conversations: ", conversations);
  // Handle the case when token is not available

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large">
          <div style={{ height: "100px" }} /> {/* Placeholder content */}
        </Spin>
      </div>
    );
  }

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
                <ConversationDetailPage {...currentConversation} />
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