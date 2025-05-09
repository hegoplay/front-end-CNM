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

export interface MemberDto{
  phoneNumber: string;
  name: string;
  isAdmin: boolean;
  isLeader: boolean;
  baseImg: string;
  isOnline: boolean;
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
  lastMessage: MessageResponse | undefined; // Last message object
  conversationImgUrl?: string;
  unreadCount?: number;
}

export interface ConversationDetailDto {
  id: string;
  type: ConversationType;
  participants: string[];
  participantsDetails: MemberDto[];
  messageDetails: MessageResponse[]; // Full message objects
  updateAt: string; // ISO 8601 format
  callInProgress: boolean;
  currentCallId?: string;
  conversationName?: string;
  leader?: string;
  admins?: string[];
  conversationImgUrl?: string;
}

export const mapConversationDetailDtoToConversationDto = (conversationDetail: ConversationDetailDto): ConversationDto => {
  return {
    id: conversationDetail.id,
    type: conversationDetail.type,
    participants: conversationDetail.participants,
    messages: conversationDetail.messageDetails ? conversationDetail.messageDetails.map(message => message.id) : [],
    updatedAt: conversationDetail.updateAt,
    callInProgress: conversationDetail.callInProgress,
    currentCallId: conversationDetail.currentCallId,
    conversationName: conversationDetail.conversationName,
    leader: conversationDetail.leader,
    admins: conversationDetail.admins,
    lastMessage: conversationDetail.messageDetails ? conversationDetail.messageDetails[conversationDetail.messageDetails.length - 1] : undefined,
    conversationImgUrl: conversationDetail.conversationImgUrl,
  }};

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