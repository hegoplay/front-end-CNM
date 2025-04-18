"use client";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Manager } from "socket.io-client";
import { Socket } from "socket.io-client";
type ManagerType = ReturnType<typeof Manager>;
type SocketType = ReturnType<ManagerType["socket"]>;

// Định nghĩa interface cho trạng thái cuộc gọi
interface CallState {
  isConnected: boolean; // Trạng thái kết nối Socket.IO tới /call
  isCalling: boolean; // Đang trong cuộc gọi hay không
  localStream?: MediaStream; // Stream từ webcam/micro của client
  remoteStreams: { [username: string]: MediaStream }; // Stream từ các participant khác
  currentRoomId?: string; // ID của room hiện tại (thường là conversationId)
}

// Định nghĩa interface cho các hành động liên quan đến cuộc gọi
interface CallActions {
  joinCall: (roomId: string) => Promise<boolean>; // Tham gia room và khởi tạo media
  startCall: () => Promise<boolean>; // Bắt đầu signaling WebRTC
  endCall: () => void; // Kết thúc cuộc gọi và dọn dẹp
}

// Hook useCall để quản lý namespace /call
const useCall = (url: string, token: string) => {
  // State quản lý socket và trạng thái cuộc gọi
  const [socket, setSocket] = useState<SocketType | null>(null); // Socket instance cho /call
  const [manager, setManager] = useState<ManagerType | null>(null); // Socket.IO Manager
  const [state, setState] = useState<CallState>({
    isConnected: false,
    isCalling: false,
    remoteStreams: {},
  });

  // Ref để lưu peerConnections và theo dõi component mount/unmount
  const peerConnections = useRef<{ [username: string]: RTCPeerConnection }>({}); // Lưu RTCPeerConnection cho từng participant
  const isMounted = useRef(true); // Theo dõi component có unmount không

  // Effect để khởi tạo kết nối Socket.IO tới namespace /call
  useEffect(() => {
    // Kiểm tra url và token hợp lệ
    if (!url || !token) {
      console.error("Invalid url or token:", { url, token });
      return;
    }

    // Tạo Socket.IO Manager để quản lý kết nối
    const newManager = new Manager(url, {
      reconnectionAttempts: 3, // Thử kết nối lại 3 lần
      reconnectionDelay: 1000, // Delay 1s giữa các lần thử
      autoConnect: true,
      query: { token }, // Gửi token qua query để xác thực
      transports: ["websocket"], // Sử dụng WebSocket
      auth: { token }, // Gửi token qua auth
    });

    // Tạo socket instance cho namespace /call
    const socketInstance = newManager.socket("/call");

    // Xử lý khi kết nối thành công
    const onConnect = () => {
      setState((prev) => ({ ...prev, isConnected: true }));
      console.log("Call socket connected");
    };

    // Xử lý khi ngắt kết nối
    const onDisconnect = () => {
      setState((prev) => ({ ...prev, isConnected: false, isCalling: false }));
      console.log("Call socket disconnected");
    };

    // Xử lý lỗi socket
    const onError = (error: Error) => {
      console.error("Call socket error:", error);
    };

    // Xử lý lời mời gọi từ server (gửi qua /chat, nhưng client có thể xử lý ở đây nếu cần)
    const onCallInvitation = (data: {
      conversationId: string;
      initiator: string;
      callType: string;
    }) => {
      console.log("Received call invitation:", data);
      setState((prev) => ({
        ...prev,
        currentRoomId: data.conversationId, // Lưu conversationId làm roomId
        isCalling: true, // Bắt đầu trạng thái gọi
      }));
      // Tự động tham gia room
      socketInstance.emit("join_room", data.conversationId);
    };

    // Xử lý danh sách client trong room
    const onRoomClients = (clients: string[]) => {
      console.log("Clients in room:", clients);
      // Có thể dùng để hiển thị danh sách participant trong UI
    };

    // Xử lý offer từ WebRTC
    const onOffer = async (data: {
      sender: string;
      sdp: string;
      roomId: string;
    }) => {
      console.log("Received offer from:", data.sender);
      const peerConnection = createPeerConnection(data.sender);
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription({ type: "offer", sdp: data.sdp })
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socketInstance.emit("answer", {
        roomId: data.roomId,
        target: data.sender,
        sdp: answer.sdp,
      });
    };

    // Xử lý answer từ WebRTC
    const onAnswer = async (data: {
      sender: string;
      sdp: string;
      roomId: string;
    }) => {
      console.log("Received answer from:", data.sender);
      const peerConnection = peerConnections.current[data.sender];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription({ type: "answer", sdp: data.sdp })
        );
      }
    };

    // Xử lý ICE candidate từ WebRTC
    const onIceCandidate = async (data: {
      sender: string;
      candidate: RTCIceCandidateInit;
      roomId: string;
    }) => {
      console.log("Received ICE candidate from:", data.sender);
      const peerConnection = peerConnections.current[data.sender];
      if (peerConnection) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    };

    // Xử lý lỗi cuộc gọi
    const onCallError = (error: string | null) => {
      console.log("Received call_error:", error); // Log để debug giá trị error
      if (onCallError && isMounted.current) {
        onCallError(error);
      }
    };

    // Đăng ký các sự kiện Socket.IO
    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);
    socketInstance.on("error", onError);
    socketInstance.on("call_invitation", onCallInvitation);
    socketInstance.on("room_clients", onRoomClients);
    socketInstance.on("offer", onOffer);
    socketInstance.on("answer", onAnswer);
    socketInstance.on("ice_candidate", onIceCandidate);
    socketInstance.on("call_error", onCallError);

    // Lưu socket và manager vào state
    setManager(newManager);
    setSocket(socketInstance);

    // Cleanup khi component unmount
    return () => {
      isMounted.current = false;
    };
  }, [url, token]);

  // Effect để cleanup socket và WebRTC khi component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        // Gỡ các sự kiện Socket.IO
        socket.off("connect");
        socket.off("disconnect");
        socket.off("error");
        socket.off("call_invitation");
        socket.off("room_clients");
        socket.off("offer");
        socket.off("answer");
        socket.off("ice_candidate");
        socket.off("call_error");
        socket.disconnect();
      }
      if (manager) {
        manager.removeAllListeners();
      }
      // Đóng tất cả peerConnections
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      // Dừng local stream
      if (state.localStream) {
        state.localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [socket, manager, state.localStream]);

  // Khởi tạo media (webcam/micro)
  const initMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setState((prev) => ({ ...prev, localStream: stream }));
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      return null;
    }
  }, []);

  // Tạo RTCPeerConnection cho một participant
  const createPeerConnection = useCallback(
    (targetUsername: string) => {
      // Cấu hình WebRTC với STUN server
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: ["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302"] }],
      });

      // Xử lý ICE candidate
      peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate && state.currentRoomId) {
          socket?.emit("ice_candidate", {
            roomId: state.currentRoomId,
            target: targetUsername,
            candidate,
          });
        }
      };

      // Xử lý remote stream
      peerConnection.ontrack = (event) => {
        setState((prev) => ({
          ...prev,
          remoteStreams: {
            ...prev.remoteStreams,
            [targetUsername]: event.streams[0],
          },
        }));
      };

      // Thêm local stream vào peerConnection
      if (state.localStream) {
        const stream: MediaStream = state.localStream;
        stream.getTracks().forEach((track) =>
          peerConnection.addTrack(track, stream)
        );
      }

      // Lưu peerConnection
      peerConnections.current[targetUsername] = peerConnection;
      return peerConnection;
    },
    [socket, state.currentRoomId, state.localStream]
  );

  // Tham gia cuộc gọi
  const joinCall = useCallback(
    async (roomId: string) => {
      if (!socket) return false;
      // Lưu roomId và khởi tạo media
      setState((prev) => ({ ...prev, currentRoomId: roomId }));
      socket.emit("join_room", roomId);
      const stream = await initMedia();
      return !!stream; // Trả về true nếu khởi tạo media thành công
    },
    [socket, initMedia]
  );

  // Bắt đầu cuộc gọi (tạo offer)
  const startCall = useCallback(async () => {
    if (!socket || !state.currentRoomId) return false;
    const stream = await initMedia();
    if (!stream) return false;

    // Tạo peerConnection (initiator không cần target cụ thể vì server sẽ gửi offer tới tất cả)
    const peerConnection = createPeerConnection("initiator");
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", { roomId: state.currentRoomId, sdp: offer.sdp });
    setState((prev) => ({ ...prev, isCalling: true }));
    return true;
  }, [socket, state.currentRoomId, initMedia, createPeerConnection]);

  // Kết thúc cuộc gọi
  const endCall = useCallback(() => {
    if (socket && state.currentRoomId) {
      socket.emit("leave_room", state.currentRoomId); // Gửi sự kiện leave_room (cần thêm ở server)
    }
    // Đóng peerConnections
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
    // Dừng local stream
    if (state.localStream) {
      state.localStream.getTracks().forEach((track) => track.stop());
    }
    // Reset state
    setState((prev) => ({
      ...prev,
      isCalling: false,
      localStream: undefined,
      remoteStreams: {},
      currentRoomId: undefined,
    }));
  }, [socket, state.currentRoomId, state.localStream]);

  // Memoize actions để tránh re-render không cần thiết
  const actions: CallActions = useMemo(
    () => ({
      joinCall,
      startCall,
      endCall,
    }),
    [joinCall, startCall, endCall]
  );

  return { ...state, ...actions, socket };
};

export default useCall;

/*
### Giải thích chi tiết `useCall`
1. **Cấu trúc**:
   - **State (`CallState`)**: Quản lý trạng thái cuộc gọi, bao gồm kết nối, stream, và room.
   - **Actions (`CallActions`)**: Các hàm để tham gia, bắt đầu, và kết thúc cuộc gọi.
   - **Refs**: Lưu `peerConnections` và `isMounted` để quản lý WebRTC và lifecycle.

2. **Socket.IO**:
   - Kết nối tới namespace `/call` với token xác thực.
   - Xử lý các sự kiện như `connect`, `disconnect`, `offer`, `answer`, `ice_candidate`, `call_invitation`.

3. **WebRTC**:
   - Sử dụng `RTCPeerConnection` để thiết lập kết nối P2P.
   - Quản lý nhiều `remoteStreams` để hỗ trợ multi-party sau này.
   - Tự động gửi ICE candidate và xử lý remote stream.

4. **Tích hợp với chat**:
   - Nhận `call_invitation` (từ `useSocket`) và tự động tham gia room.
   - `joinCall` và `startCall` được gọi khi người dùng xác nhận tham gia.

5. **Cleanup**:
   - Ngắt kết nối Socket.IO, đóng peerConnections, và dừng stream khi component unmount.
   - Đảm bảo không có memory leak.
*/