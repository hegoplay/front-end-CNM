'use client'
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Manager, Socket } from 'socket.io-client';
type ManagerType = ReturnType<typeof Manager>;
type SocketType = ReturnType<ManagerType['socket']>;
import {
  ConversationDto,
  MessageResponse,
  ConversationDetailDto,
  MessageRequest,
  MessageType
} from '../types/chat';

type AckResponse = 'JOIN_SUCCESS' | 'ACCESS_DENIED' | 'SENT' | 'RECALLED' | 'REACTED';

interface SocketState {
  // kiểm tra đã kết nối được chưa
  isConnected: boolean;
  // lưu danh sách hội thoại
  conversations: ConversationDto[];
  // currentConversation là hội thoại hiện tại
  // currentConversation?.messageDetails là các message đã coi của hội thoại hiện tại 
  currentConversation?: ConversationDetailDto;
  // messages lưu các message chưa coi của tất cả hội thoại để hiện thông báo người dùng chưa đọc
  messages: MessageResponse[];
}

// cái này không dùng
interface SocketActions {
  joinConversation: (conversationId: string) => Promise<boolean>;
  sendTextMessage: (content: string) => Promise<boolean>;
  recallMessage: (messageId: string) => Promise<boolean>;
  reactToMessage: (messageId: string, emoji: string) => Promise<boolean>;
}

const useSocket = (url: string, token: string) => {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [manager, setManager] = useState<ManagerType | null>(null);
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    conversations: [],
    messages: []
  });

  // Initialize socket connection
  useEffect(() => {
    const newManager = new Manager(url, {
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      autoConnect: true,
      query: { token },
      transports: ['websocket'],
      auth: { token }
    });

    const socketInstance = newManager.socket('/chat'); // Connect to main namespace

    const onConnect = () => {
      setState(prev => ({ ...prev, isConnected: true }));
      console.log('Socket connected');
    };

    const onDisconnect = () => {
      setState(prev => ({ ...prev, isConnected: false }));
    };

    const onError = (error: Error) => {
      console.error('Socket error:', error);
    };

    const onInitialConversations = (conversations: ConversationDto[]) => {
      setState(prev => ({ ...prev, conversations }));
    };

    const onInitialMessages = (conversation: ConversationDetailDto) => {
      setState(prev => ({
        ...prev,
        currentConversation: conversation,
        messages: conversation.messageDetails
      }));
    };

    const onNewMessage = (message: MessageResponse) => {
      setState(prev => {
        if (prev.messages.some(m => m.id === message.id)) return prev;
        if (prev.currentConversation?.id !== message.conversationId) {
          return {
            ...prev,
            messages: [...prev.messages, message]
          };
        }
        return {
          ...prev,
          currentConversation: {
            ...prev.currentConversation,
            messageDetails: [...prev.currentConversation.messageDetails, message]
          },
          messages: [...prev.messages, message]
        };
      });
    };

    const onMessageRecalled = (data: {messageId: string,conversationId: string }) => {
      console.log('Message recalled:', data);
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === data.messageId ? { ...msg, isRecalled: true } : msg
        ),
        currentConversation: prev.currentConversation?.id === data.conversationId
          ? {
              ...prev.currentConversation,
              messageDetails: prev.currentConversation.messageDetails.map(msg => 
                msg.id === data.messageId ? { ...msg, isRecalled: true } : msg
              )
            }
          : prev.currentConversation
      }));
    };

    const onReactionAdded = (data: {
      messageId: string;
      emoji: string;
      userId: string;
    }) => {
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => {
          if (msg.id !== data.messageId) return msg;
          
          const existingReaction = msg.reactions?.find(r => r.emoji === data.emoji);
          const newReactions = existingReaction
            ? msg.reactions?.map(r => 
                r.emoji === data.emoji 
                  ? { ...r, users: [...r.users, data.userId] }
                  : r
              )
            : [...(msg.reactions || []), { emoji: data.emoji, users: [data.userId] }];
            
          return {
            ...msg,
            reactions: newReactions
          };
        })
      }));
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('error', onError);
    socketInstance.on('initial_conversations', onInitialConversations);
    socketInstance.on('initial_messages', onInitialMessages);
    socketInstance.on('new_message', onNewMessage);
    // thu hồi tin nhắn
    socketInstance.on('message_recalled', onMessageRecalled);
    socketInstance.on('reaction_added', onReactionAdded);

    setManager(newManager);
    setSocket(socketInstance);

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('error', onError);
      socketInstance.off('initial_conversations', onInitialConversations);
      socketInstance.off('initial_messages', onInitialMessages);
      socketInstance.off('new_message', onNewMessage);
      socketInstance.off('message_recalled', onMessageRecalled);
      socketInstance.off('reaction_added', onReactionAdded);
      socketInstance.disconnect();
      newManager.removeAllListeners();
    };
  }, [url, token]);

  const joinConversation = useCallback(async (conversationId: string) => {
    if (!socket) return false;
    
    return new Promise<boolean>((resolve) => {
      socket.emit('join_conversation', conversationId, (ack: AckResponse) => {
        resolve(ack === 'JOIN_SUCCESS');
      });
    });
  }, [socket]);

  const sendTextMessage = useCallback(async (content: string) => {
    if (!socket || !state.currentConversation) return false;
    
    const messageRequest: MessageRequest = {
      conversationId: state.currentConversation.id,
      content,
      type: MessageType.TEXT,
      senderId: '' // Will be set by server from token
    };

    return new Promise<boolean>((resolve) => {
      socket.emit('send_text_message', messageRequest, (ack: AckResponse) => {
        resolve(ack === 'SENT');
      });
    });
  }, [socket, state.currentConversation]);

  const recallMessage = useCallback(async (messageId: string) => {
    if (!socket) return false;
    
    return new Promise<boolean>((resolve) => {
      socket.emit('recall_message', messageId, (ack: AckResponse) => {
        resolve(ack === 'RECALLED');
      });
    });
  }, [socket]);

  const reactToMessage = useCallback(async (messageId: string, emoji: string) => {
    if (!socket) return false;
    
    return new Promise<boolean>((resolve) => {
      socket.emit('react_to_message', { messageId, emoji }, (ack: AckResponse) => {
        resolve(ack === 'REACTED');
      });
    });
  }, [socket]);

  const actions: SocketActions = useMemo(() => ({
    joinConversation,
    sendTextMessage,
    recallMessage,
    reactToMessage
  }), [joinConversation, sendTextMessage, recallMessage, reactToMessage]);

  return { ...state, ...actions, socket };
};

export default useSocket;