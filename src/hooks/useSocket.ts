"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Manager, Socket } from "socket.io-client";
type ManagerType = ReturnType<typeof Manager>;
type SocketType = ReturnType<ManagerType["socket"]>;
import {
  ConversationDto,
  MessageResponse,
  ConversationDetailDto,
  MessageRequest,
  MessageType,
  Reaction,
  mapConversationDetailDtoToConversationDto,
} from "../types/chat";
import CallInvitation from "@/types/callInvitation";
// const { localStream, remoteStream, isConnected, error, callStatus } = useCall(
//   {
//     roomId,
//     token,
//     url: process.env.NEXT_PUBLIC_SOCKET_URL || "",
//     userPhone: userInfo?.phoneNumber || "",
//   }
// );

interface StartCallResponse {
  status: string;
  message: string;
}

interface SocketState {
  isConnected: boolean;
  conversations: ConversationDto[];
  currentConversation?: ConversationDetailDto;
  messages: MessageResponse[];
  unreadCounts: { [conversationId: string]: number };
}

interface SocketActions {
  getConversationsWithUnreadCounts: () => {
    conversationId: string;
    unreadCount: number;
  }[];
  startCall: (conversationId: string,  callType: "VIDEO" | "AUDIO") => Promise<StartCallResponse>; // Thêm action để khởi tạo cuộc gọi
}

const useSocket = (
  url: string,
  token: string,
  options?: {
    onCallInvitation?: (data: CallInvitation | null) => void;
    onCallError?: (error: string | null) => void;
  }
) => {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [manager, setManager] = useState<ManagerType | null>(null);
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    conversations: [],
    messages: [],
    unreadCounts: {},
  });
  // Ref để theo dõi trạng thái mounted của component
  const isMounted = useRef(true);
  // Khởi tạo socket connection
  useEffect(() => {
    // Kiểm tra giá trị url và token
    if (!url || !token) {
      console.error("Invalid url or token:", { url, token });
      return;
    }

    const newManager = new Manager(url, {
      reconnectionAttempts: 2,
      reconnectionDelay: 1000,
      autoConnect: true,
      query: { token },
      transports: ["websocket"],
      auth: { token },
    });

    const socketInstance = newManager.socket("/chat");

    const onConnect = () => {
      setState((prev) => ({ ...prev, isConnected: true }));
      console.log("Socket connected");
    };

    const onDisconnect = () => {
      // if (!isMounted.current) return;
      setState((prev) => ({ ...prev, isConnected: false }));
      console.log("Socket disconnected");
    };

    const onError = (error: Error) => {
      console.error("Socket error:", error);
    };

    const onInitialConversations = (conversations: ConversationDto[]) => {
      setState((prev) => ({ ...prev, conversations }));
    };

    const onInitialMessages = (conversation: ConversationDetailDto) => {
      setState((prev) => ({
        ...prev,
        currentConversation: conversation,
        messages: conversation.messageDetails,
      }));
    };

    const onNewMessage = (message: MessageResponse) => {
      console.log("New message received:", message);
      setState((prev) => {
        if (prev.messages.some((m) => m.id === message.id)) return prev;
        if (prev.currentConversation?.id !== message.conversationId) {
          return {
            ...prev,
            messages: [...prev.messages, message],
            unreadCounts: {
              ...prev.unreadCounts,
              [message.conversationId]:
                (prev.unreadCounts[message.conversationId] || 0) + 1,
            },
            conversations: prev.conversations.map((conv) => {
              if (conv.id === message.conversationId) {
                return {
                  ...conv,
                  lastMessage: message,
                  unreadCount:
                    (prev.unreadCounts[message.conversationId] || 0) + 1,
                  updatedAt: message.createdAt,
                };
              }
              return conv;
            }),
          };
        }
        return {
          ...prev,
          currentConversation: {
            ...prev.currentConversation,
            messageDetails: [
              ...prev.currentConversation.messageDetails,
              message,
            ],
          },
          // update on new message
          messages: [...prev.messages, message],
          unreadCounts: {
            ...prev.unreadCounts,
            [message.conversationId]: 0,
          },
          conversations: prev.conversations.map((conv) => {
            if (conv.id === message.conversationId) {
              return {
                ...conv,
                lastMessage: message,
                unreadCount: 0,
                updatedAt: message.createdAt,
              };
            }
            return conv;
          }),
        };
      });
    };

    const onMessageRecalled = (data: {
      messageId: string;
      conversationId: string;
    }) => {
      console.log("Message recalled:", data);
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === data.messageId ? { ...msg, isRecalled: true } : msg
        ),
        currentConversation:
          prev.currentConversation?.id === data.conversationId
            ? {
                ...prev.currentConversation,
                messageDetails: prev.currentConversation.messageDetails.map(
                  (msg) =>
                    msg.id === data.messageId
                      ? { ...msg, isRecalled: true }
                      : msg
                ),
              }
            : prev.currentConversation,
      }));
    };

    const onReactionAdded = (data: {
      messageId: string;
      emoji: string;
      userId: string;
      conversationId: string;
    }) => {
      console.log("Reaction added:", data);
      // console.log("Is mounted:", isMounted.current);
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) => {
          if (msg.id !== data.messageId) return msg;

          const existingReaction = msg.reactions?.find(
            (r) => r.emoji === data.emoji
          );
          let newReactions: Reaction[];
          if (existingReaction) {
            if (existingReaction.users.includes(data.userId)) {
              return msg;
            }
            newReactions = msg.reactions!.map((r) =>
              r.emoji === data.emoji
                ? { ...r, users: [...r.users, data.userId] }
                : r
            );
          } else {
            newReactions = [
              ...(msg.reactions || []),
              { emoji: data.emoji, users: [data.userId] },
            ];
          }

          return {
            ...msg,
            reactions: newReactions,
          };
        }),
        currentConversation:
          prev.currentConversation?.id === data.conversationId
            ? {
                ...prev.currentConversation,
                messageDetails: prev.currentConversation.messageDetails.map(
                  (msg) => {
                    if (msg.id !== data.messageId) return msg;

                    const existingReaction = msg.reactions?.find(
                      (r) => r.emoji === data.emoji
                    );
                    let newReactions: Reaction[];
                    if (existingReaction) {
                      newReactions = msg.reactions!.map((r) =>
                        r.emoji === data.emoji
                          ? { ...r, users: [...r.users, data.userId] }
                          : r
                      );
                    } else {
                      newReactions = [
                        ...(msg.reactions || []),
                        { emoji: data.emoji, users: [data.userId] },
                      ];
                    }

                    return {
                      ...msg,
                      reactions: newReactions,
                    };
                  }
                ),
              }
            : prev.currentConversation,
      }));
    };
    const onUnreadCounts = (unreadCounts: {
      [conversationId: string]: number;
    }) => {
      // console.log('Received unread counts:', unreadCounts);
      setState((prev) => ({
        ...prev,
        unreadCounts,
      }));
    };
    const onReadConversation = (data: {
      conversationId: string;
      userId: string;
    }) => {
      const { conversationId } = data;
      console.log("Received read_conversation event:", data);

      // Cập nhật unreadCounts: đặt conversationId về 0
      setState((prev) => ({
        ...prev,
        unreadCounts: {
          ...prev.unreadCounts,
          [conversationId]: 0,
        },
      }));
    };
    const onNewConversation = (conversation: ConversationDto) => {
      console.log("Received new_conversation event:", conversation);
      setState((prev) => ({
        ...prev,
        conversations: [conversation, ...prev.conversations ],
      }));
    };
    const onDeleteConversation = (conversationId: string) => {
      console.log("Received delete_conversation event:", conversationId);
      setState((prev) => ({
        ...prev,
        conversations: prev.conversations.filter(
          (conv) => conv.id !== conversationId
        ),
      }));
    };
    // Xử lý call_invitation

    const onClearConversation = (conversationId: string) => {
      setState((prev) => ({
        ...prev,
        currentConversation: prev.currentConversation?.id
          ? {
              ...prev.currentConversation,
              messageDetails: []
              ,
            }
          : undefined,
      }))
    };

    const onConversationUpdate = (conversation: ConversationDetailDto) => {
      console.log("Received conversation_update event:", conversation);
      setState((prev) => ({
        ...prev,
        conversations: [
          {
            ...mapConversationDetailDtoToConversationDto(conversation),
            unreadCount: prev.unreadCounts[conversation.id] || 0,
            
          },
          ...prev.conversations.filter((conv) => conv.id !== conversation.id),
        ],
        currentConversation:
          prev.currentConversation?.id === conversation.id
            ? {
                ...prev.currentConversation,
                ...conversation,
              }
            : prev.currentConversation,
      }));
    }

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);
    socketInstance.on("error", onError);
    socketInstance.on("initial_conversations", onInitialConversations);
    socketInstance.on("initial_messages", onInitialMessages);
    socketInstance.on("new_message", onNewMessage);
    socketInstance.on("message_recalled", onMessageRecalled);
    socketInstance.on("reaction_added", onReactionAdded);
    socketInstance.on("unread_counts", onUnreadCounts);
    socketInstance.on("read_conversation", onReadConversation);
    socketInstance.on("new_conversation", onNewConversation);
    socketInstance.on("delete_conversation", onDeleteConversation);
    socketInstance.on("clear_conversation", onClearConversation);
    socketInstance.on("conversation_update",onConversationUpdate);
    
    if(options?.onCallInvitation) {
      socketInstance.on("call_invitation", options.onCallInvitation); // Thêm sự kiện call_invitation
    }
    if(options?.onCallError) {
      socketInstance.on("call_error", options.onCallError); // Thêm sự kiện call_error
    }
    // socketInstance.on("call_error", ); // Thêm sự kiện call_error

    setManager(newManager);
    setSocket(socketInstance);

    // Cleanup chỉ khi component unmount
    
  }, [url, token, options?.onCallInvitation, options?.onCallError]);

  useEffect(() => {
    return () => {
      console.log("Cleanup useSocket: url:", url, "token:", token);
      isMounted.current = false;
      if (!socket) return;
      socket.off("connect");
      socket.off("disconnect");
      socket.off("error");
      socket.off("initial_conversations");
      socket.off("initial_messages");
      socket.off("new_message");
      socket.off("message_recalled");
      socket.off("reaction_added");
      socket.off("unread_counts");
      socket.off("read_conversation");
      socket.off("new_conversation");
      socket.off("delete_conversation");
      socket.off("call_invitation");
      socket.off("conversation_update");
      socket.off("call_error");
      socket.off("clear_conversation");
      socket.disconnect();
      if (manager) {
        manager.removeAllListeners();
      }
    };
  }, [url, token, socket, manager]);

  const getConversationsWithUnreadCounts = useCallback(() => {
    return Object.entries(state.unreadCounts).map(
      ([conversationId, unreadCount]) => ({
        conversationId,
        unreadCount,
      })
    );
  }, [state.unreadCounts]);

  const startCall = useCallback(
    async (
      conversationId: string,
      callType: "VIDEO" | "AUDIO",
    ): Promise<StartCallResponse> => {
      console.log("Starting call for conversation:", conversationId);
      if (!socket) {
        console.error("Socket is not initialized");
        throw new Error("Socket is not initialized");
      }
  
      try {
        const response = await new Promise<StartCallResponse>((resolve, reject) => {
          socket.emit(
            "start_call",
            { conversationId, callType },
            (ack: StartCallResponse) => {
              console.log("Received ack from server:", ack);  
              if (ack.status === "success") {
                resolve(ack);
              } else {
                reject(new Error(ack.message));
              }
            }
          );
        });
        console.log("Call started successfully:", response);
        return response;
      } catch (error) {
        console.error("Failed to start call:", error);
        throw error;
      }
    },
    [socket] // socket nên được typed trong context hoặc parent component
  );

  const actions: SocketActions = useMemo(
    () => ({
      getConversationsWithUnreadCounts,
      startCall, // Thêm startCall vào actions
    }),
    [getConversationsWithUnreadCounts, startCall]
  );



  return {
    ...state,
    ...actions,
    socket,
    
    // isMounted: isMounted.current, // Trả về giá trị mounted
  };
};

export default useSocket;
