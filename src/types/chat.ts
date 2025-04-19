// Enums
export enum ConversationType {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP',
  CHANNEL = 'CHANNEL'
}

export enum MessageType {
  TEXT = 'TEXT',
  MEDIA = 'MEDIA',
  FILE = 'FILE',
  CALL = 'CALL'
}

// Interfaces
export interface CallEvent {
  callId: string;
  action: 'started' | 'ended' | 'missed';
  duration?: number; // seconds
}

export interface MessageRequest {
  conversationId: string;
  senderId: string;
  content: string; // Text content hoặc media URL
  type: 'TEXT' | 'MEDIA' | 'FILE' | 'CALL';
  replyTo?: string; // ID tin nhắn được reply (nullable)
  callEvent?: CallEvent; // Dùng khi type = CALL_EVENT
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'MEDIA' | 'FILE' | 'CALL';
  mediaUrl?: string;
  createdAt: string; // ISO 8601 format
  isRecalled: boolean;
  replyTo?: string;
  reactions?: Reaction[];
  callId? : string; // ID cuộc gọi (nếu có)
}

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface ConversationDto {
  id: string;
  type: ConversationType;
  participants: string[];
  messages: string[]; // message IDs
  updatedAt: string; // ISO 8601 format
  callInProgress: boolean;
  currentCallId?: string;
// updated
  conversationName?: string;
  leader?: string;
  admins?: string[];
  lastMessage: MessageResponse;
  conversationImgUrl?: string;
  unreadCount?: number;
}

export interface ConversationDetailDto {
  id: string;
  type: ConversationType;
  participants: string[];
  messageDetails: MessageResponse[]; // Full message objects
  updateAt: string; // ISO 8601 format
  callInProgress: boolean;
  currentCallId?: string;
  conversationName?: string;
  leader?: string;
  admins?: string[];
  conversationImgUrl?: string;
}

// Type guards
export function isCallEventMessage(message: MessageResponse): message is MessageResponse & { callEvent: CallEvent } {
  return message.type === MessageType.CALL && !!message.type;
}

// Utility types
export type MessageWithReactions = MessageResponse & {
  reactions: Reaction[];
};

export type CallStartEvent = CallEvent & {
  action: 'started';
};

export type CallEndEvent = CallEvent & {
  action: 'ended';
  duration: number;
};