import { UserResponseDto } from "./user";

export default interface CallInvitation {
  conversationId: string;
  initiator: UserResponseDto;
  callType: "video" | "audio";
}
