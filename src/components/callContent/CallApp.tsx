"use client";

import React, { useEffect, useRef, useState } from "react";
import useCall, { CallState } from "@/hooks/useCall";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { FaVideo } from "react-icons/fa6";
import { IoIosCall } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";
import "./CallApp.css";

interface CallAppProps {
  token: string;
  roomId: string;
  userPhone: string;
}

const CallApp: React.FC<CallAppProps> = ({ token, roomId, userPhone }) => {
  const [shouldConnect, setShouldConnect] = useState(true);
  const { userInfo } = useUser();
  const router = useRouter();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);

  const callState: CallState = shouldConnect
    ? useCall({
        roomId,
        url: process.env.NEXT_PUBLIC_SOCKET_URL || "",
        // userPhone: userInfo?.phoneNumber || "",
        userPhone: userPhone,
        token,
      })
    : {
        localStream: null,
        remoteStream: null,
        isConnected: false,
        error: null,
        callStatus: "disconnected" as const,
        toggleCamera: () => {},
        toggleMicrophone: () => {},
      };

  const {
    localStream,
    remoteStream,
    error,
    callStatus,
  } = callState;

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!token) {
      console.error("Token is missing");
      setShouldConnect(false);
      router.push("/");
      return;
    }
    if (!userInfo?.phoneNumber) {
      console.error("User phone number is missing");
      setShouldConnect(false);
      router.push("/");
      return;
    }
  }, [token, userInfo, router]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleEndCall = () => {
    // setShouldConnect(false);
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    // setShouldConnect(false);
    // setIsCameraOn(false);
    // setIsMicrophoneOn(false);
    // Disconnect the socket connection if needed
    router.push("/");
  };

  const handleToggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOn((prev) => !prev);
    }
  };
  const handleToggleMicrophone = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicrophoneOn((prev) => !prev);
    }
  };

  if (!shouldConnect || callStatus === "failed") {
    return (
      <div>
        <h2>Call Error</h2>
        <p>{error || "An error occurred. Please try again."}</p>
        <button onClick={() => router.push("/")}>Back to Home</button>
      </div>
    );
  }

  if (callStatus === "disconnected") {
    return (
      <div>
        <h2>Call Ended</h2>
        <p>The call has ended.</p>
        <button onClick={() => router.push("/")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div>
      {/* <h2>Call App - {userInfo?.name}</h2>
      <p>Room ID: {roomId}</p>
      <p>Connection Status: {isConnected ? "Connected" : "Disconnected"}</p>
      <p>Call Status: {callStatus}</p> */}

      <div>
        <h3>Your Video</h3>
        <video
          className="small-frame"
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          // style={{ width: "300px", height: "200px", border: "1px solid black" }}
        />
      </div>

      <div>
        <h3>Remote Video</h3>
        <video
          className="video-player"
          ref={remoteVideoRef}
          autoPlay
          playsInline
          // style={{ width: "300px", height: "200px", border: "1px solid black" }}
        />
      </div>
      <div className="fixed bottom-0 left-0 right-0 text-white p-4">
        <div className="flex justify-center items-center gap-10">
          <div
            className={`p-4 rounded-full ${
              isCameraOn ? "bg-blue-300" : "bg-red-600"
            }`}
            onClick={handleToggleCamera}
          >
            <FaVideo />
          </div>
          <div
            className={`p-4 rounded-full ${
              isMicrophoneOn ? "bg-blue-300" : "bg-red-600"
            }`}
            onClick={handleToggleMicrophone}
          >
            <FaMicrophone />
          </div>
          <div className="p-4 rounded-full bg-red-600" onClick={handleEndCall}>
            <IoIosCall />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallApp;
