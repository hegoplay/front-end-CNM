import { UserResponseDto } from "./user";

export default interface CallInvitation {
  conversationId: string;
  callType: "VIDEO" | "AUDIO";
  initiator: UserResponseDto;
}
