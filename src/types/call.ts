export interface CallResponseDto {
  id: string;
    // private CallType callType; // "video" | "audio"
  callType: "VIDEO" | "AUDIO";
    // private CallStatus status;
  status: "PENDING"| "ONGOING"| "ENDED"
}