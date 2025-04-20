import { useEffect, useRef, useState } from "react";
import io, { Manager, Socket } from "socket.io-client";

type ManagerType = ReturnType<typeof Manager>;
type SocketType = ReturnType<ManagerType["socket"]>;

const managerInstances = new Map<
  string,
  { manager: ManagerType; usageCount: number }
>();

interface UseCallProps {
  url: string;
  roomId: string;
  userPhone: string;
  token: string;
}

export interface CallState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  error: string | null;
  callStatus: "connecting" | "connected" | "disconnected" | "failed" | "ended";
  toggleCamera: () => void;
  toggleMicrophone: () => void;
}

const useCall = ({ roomId, url, token, userPhone }: UseCallProps): CallState => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "disconnected" | "failed" | "ended">("connecting");

  const socketRef = useRef<SocketType | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteUsernameRef = useRef<string | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    setCallStatus("connecting");
  },[]);
  
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  }

  const toggleMicrophone = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  useEffect(() => {
    // Chỉ chạy setup nếu component chưa mount
    if (isMounted.current) return;

    isMounted.current = true;
    console.log("Component mounted, setting up call");

    if (!url || !token) {
      console.error("Invalid url or token:", { url, token });
      setError("Invalid url or token");
      setCallStatus("failed");
      return;
    }

    let managerEntry = managerInstances.get(url);
    if (!managerEntry) {
      const manager = new Manager(url, {
        reconnectionAttempts: 2,
        reconnectionDelay: 1000,
        autoConnect: true,
        query: { token, roomId },
        transports: ["websocket"],
        auth: { token },
      });
      managerEntry = { manager, usageCount: 0 };
      managerInstances.set(url, managerEntry);
    }

    managerEntry.usageCount += 1;
    socketRef.current = managerEntry.manager.socket("/call");

    const initWebRTC = async () => {
      try {
        peerConnectionRef.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        stream.getTracks().forEach((track) => {
          peerConnectionRef.current?.addTrack(track, stream);
        });
// sus
        peerConnectionRef.current.ontrack = (event) => {
          const [remote] = event.streams;
          setRemoteStream(remote);
        };

        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate && socketRef.current && remoteUsernameRef.current) {
            socketRef.current.emit("ice_candidate", {
              roomId,
              targetUserId: remoteUsernameRef.current,
              candidate: event.candidate,
            });
          }
        };
      } catch (err) {
        setError("Failed to initialize WebRTC: " + (err as Error).message);
        setCallStatus("failed");
      }
    };

    const resetWebRTC = async () => {
      // Clean up existing connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      setCallStatus("connecting");
      setIsConnected(false);
      // if (localStream) {
      //   localStream.getTracks().forEach((track) => track.stop());
      //   setLocalStream(null);
      // }
      // setRemoteStream(null);
      // setIsConnected(false);
      // setCallStatus("disconnected");
      // remoteUsernameRef.current = null;
  
      // Reinitialize WebRTC
      await initWebRTC();
    };

    initWebRTC();

    socketRef.current?.on("auth_error", (message: string) => {
      setError(`Authentication failed: ${message}`);
      setCallStatus("failed");
      socketRef.current?.disconnect();
    });

    socketRef.current?.on("room_full", () => {
      setError("Room is full");
      setCallStatus("failed");
      socketRef.current?.disconnect();
    });

    socketRef.current?.on("call_ended", (message: string) => {
      setError(message);
      setCallStatus("ended");
      socketRef.current?.disconnect();
    });

    socketRef.current?.on("user_joined", ({ userId }: { userId: string }) => {
      if (userId !== userPhone && peerConnectionRef.current) {
        remoteUsernameRef.current = userId;
        peerConnectionRef.current.createOffer().then((offer) => {
          peerConnectionRef.current?.setLocalDescription(offer);
          socketRef.current?.emit("offer", {
            roomId,
            targetUserId: userId,
            offer,
          });
        });
      }
      console.log("User joined:", userId);
      setCallStatus("connecting");
    });

    socketRef.current?.on(
      "offer",
      ({ offer, senderId }: { offer: RTCSessionDescriptionInit; senderId: string }) => {
        if (peerConnectionRef.current) {
          remoteUsernameRef.current = senderId;
          peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          peerConnectionRef.current.createAnswer().then((answer) => {
            peerConnectionRef.current?.setLocalDescription(answer);
            socketRef.current?.emit("answer", {
              roomId,
              targetUserId: senderId,
              answer,
            });
          });
        }
      }
    );

    socketRef.current?.on(
      "answer",
      ({ answer, senderId }: { answer: RTCSessionDescriptionInit; senderId: string }) => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setIsConnected(true);
          setCallStatus("connected");
        }
      }
    );

    socketRef.current?.on(
      "ice_candidate",
      ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    );

    socketRef.current?.on("user_left", async () => {
      if (isMounted.current) {
        console.log("User left, resetting WebRTC connection");
        await resetWebRTC();
      }
    });

    // Cleanup khi component unmount thực sự
    return () => {
      if (isMounted.current) {
        console.log("Component unmounted, cleaning up");
        socketRef.current?.emit("leave_call", { roomId });
        socketRef.current?.disconnect();
        peerConnectionRef.current?.close();
        localStream?.getTracks().forEach((track) => track.stop());
        

        const managerEntry = managerInstances.get(url);
        if (managerEntry) {
          managerEntry.usageCount -= 1;
          if (managerEntry.usageCount <= 0) {
            managerInstances.delete(url);
            console.log(`Manager for ${url} removed as no sockets are using it`);
          }
        }
        isMounted.current = false;
      }
    };
  }, [roomId, userPhone, token, url]);

  return { localStream, remoteStream, isConnected, error, callStatus, toggleCamera, toggleMicrophone }; 
};

export default useCall;