// types/user.ts
import { LocalDateTime } from 'js-joda'; // Giả sử dùng js-joda để xử lý LocalDateTime

// Type từ User model
export interface CallSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  muteMicrophone: boolean;
  hideVideo: boolean;
}

export interface User {
  phoneNumber: string;
  baseImg: string;
  backgroundImg: string;
  name: string;
  bio: string;
  isMale: boolean;
  dateOfBirth: string; // Chuyển LocalDate thành string cho frontend
  status: string;
  isOnline: boolean;
  lastOnlineTime: string; // Chuyển LocalDateTime thành string
  createdAt: string;
  updatedAt: string;
  requestList: string[];
  friends: string[];
  pendings: string[];
  mutedConversation: string[];
  currentCallId: string | null;
  callSettings: CallSettings;
}

// Type từ UserResponseDto
export interface UserResponseDto {
  phoneNumber: string;
  name: string;
  isMale: boolean;
  dateOfBirth: string;
  bio: string;
  baseImg: string;
  backgroundImg: string;
  status: string;
  online: boolean;
  lastOnlineTime: string;
}

export interface UserInfo {
  phoneNumber: string;
  name: string;
  baseImg: string;
}

// Type cho Context
// types/user.ts
export interface UserContextType {
  userInfo: UserResponseDto | null;
  setUserInfo: (info: UserResponseDto | null) => void;
  login: () => Promise<void>;
  logout: () => void;
  updateUserInfo: (updates: Partial<UserUpdateRequest>) => Promise<void>;
  isLoading: boolean;
}

export interface UserUpdateRequest {
  name: string;
  isMale: boolean;
  dateOfBirth: string; // LocalDate thường thành "YYYY-MM-DD"
  bio: string;
  baseImg: File | null;
  backgroundImg: File | null;
}

export interface UserReactionInfo{
  user: UserResponseDto;
  count: number;
}

export interface MessageReactionDto{
  messageId: string;
  reactions: Record<string, UserReactionInfo[]>;
  reactionCounts: Record<string, number>;
}