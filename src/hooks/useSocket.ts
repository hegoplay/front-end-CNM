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
} from "../types/chat";

type AckResponse =
  | "JOIN_SUCCESS"
  | "ACCESS_DENIED"
  | "SENT"
  | "RECALLED"
  | "REACTED";

interface SocketState {
  isConnected: boolean;
  conversations: ConversationDto[];
  currentConversation?: ConversationDetailDto;
  messages: MessageResponse[];
  unreadCounts: { [conversationId: string]: number };
}

interface SocketActions {
  joinConversation: (conversationId: string) => Promise<boolean>;
  sendTextMessage: (content: string) => Promise<boolean>;
  recallMessage: (messageId: string) => Promise<boolean>;
  reactToMessage: (messageId: string, emoji: string) => Promise<boolean>;
  getConversationsWithUnreadCounts: () => {
    conversationId: string;
    unreadCount: number;
  }[];
}

const useSocket = (url: string, token: string) => {

  
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [manager, setManager] = useState<ManagerType | null>(null);
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    conversations: [],
    messages: [],
    unreadCounts: {},
  });

  // Ref để theo dõi component có unmount hay không
  const isMounted = useRef(true);

  // Khởi tạo socket connection
  useEffect(() => {
    // Kiểm tra giá trị url và token
    if (!url || !token) {
      console.error("Invalid url or token:", { url, token });
      return;
    }

    const newManager = new Manager(url, {
      reconnectionAttempts: 3,
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
          messages: [...prev.messages, message],
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
      setState((prev) => ({
        ...prev,
        conversations: [...prev.conversations, conversation],
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

    setManager(newManager);
    setSocket(socketInstance);

    // Cleanup chỉ khi component unmount
    return () => {
      isMounted.current = false;
    };
  }, [url, token]);

  // Cleanup socket khi component unmount
  useEffect(() => {
    return () => {
      if (socket) {
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
        socket.disconnect();
      }
      if (manager) {
        manager.removeAllListeners();
      }
    };
  }, [socket, manager]); // Dependency là socket và manager, không chạy lại trừ khi socket/manager thay đổi

  const joinConversation = useCallback(
    async (conversationId: string) => {
      if (!socket) return false;

      return new Promise<boolean>((resolve) => {
        socket.emit("join_conversation", conversationId, (ack: AckResponse) => {
          resolve(ack === "JOIN_SUCCESS");
        });
      });
    },
    [socket]
  );

  const sendTextMessage = useCallback(
    async (content: string) => {
      if (!socket || !state.currentConversation) return false;

      const messageRequest: MessageRequest = {
        conversationId: state.currentConversation.id,
        content,
        type: MessageType.TEXT,
        senderId: "",
      };

      return new Promise<boolean>((resolve) => {
        socket.emit("send_text_message", messageRequest, (ack: AckResponse) => {
          resolve(ack === "SENT");
        });
      });
    },
    [socket, state.currentConversation]
  );

  const recallMessage = useCallback(
    async (messageId: string) => {
      if (!socket) return false;

      return new Promise<boolean>((resolve) => {
        socket.emit("recall_message", messageId, (ack: AckResponse) => {
          resolve(ack === "RECALLED");
        });
      });
    },
    [socket]
  );

  const reactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      if (!socket) return false;

      return new Promise<boolean>((resolve) => {
        socket.emit(
          "react_to_message",
          { messageId, emoji },
          (ack: AckResponse) => {
            resolve(ack === "REACTED");
          }
        );
      });
    },
    [socket]
  );

  const getConversationsWithUnreadCounts = useCallback(() => {
    return Object.entries(state.unreadCounts).map(
      ([conversationId, unreadCount]) => ({
        conversationId,
        unreadCount,
      })
    );
  }, [state.unreadCounts]);

  const actions: SocketActions = useMemo(
    () => ({
      joinConversation,
      sendTextMessage,
      recallMessage,
      reactToMessage,
      getConversationsWithUnreadCounts,
    }),
    [
      joinConversation,
      sendTextMessage,
      recallMessage,
      reactToMessage,
      getConversationsWithUnreadCounts,
    ]
  );

  return { ...state, ...actions, socket };
};

export default useSocket;
