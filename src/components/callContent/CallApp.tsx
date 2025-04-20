"use client";

import React, { useEffect, useRef, useState } from "react";
import useCall from "@/hooks/useCall";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

interface CallAppProps {
  token: string;
  roomId: string;
}

const CallApp: React.FC<CallAppProps> = ({ token, roomId }) => {
  const [shouldConnect, setShouldConnect] = useState(true);
  const { userInfo } = useUser();
  const router = useRouter();

  const callState = shouldConnect
    ? useCall({
        roomId,
        url: process.env.NEXT_PUBLIC_SOCKET_URL || "",
        userPhone: userInfo?.phoneNumber || "",
        token,
      })
    : {
        localStream: null,
        remoteStream: null,
        isConnected: false,
        error: null,
        callStatus: "disconnected" as const,
      };

  const { localStream, remoteStream, isConnected, error, callStatus } = callState;

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
    setShouldConnect(false);
    router.push("/");
  };

  if (!shouldConnect || callStatus === "failed" ) {
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
    <div style={{ padding: "20px" }}>
      <h2>Call App - {userInfo?.name}</h2>
      <p>Room ID: {roomId}</p>
      <p>Connection Status: {isConnected ? "Connected" : "Disconnected"}</p>
      <p>Call Status: {callStatus}</p>

      <div>
        <h3>Your Video</h3>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "300px", height: "200px", border: "1px solid black" }}
        />
      </div>

      <div>
        <h3>Remote Video</h3>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: "300px", height: "200px", border: "1px solid black" }}
        />
      </div>

      {callStatus === "connected" && (
        <button onClick={handleEndCall} style={{ marginTop: "10px" }}>
          End Call
        </button>
      )}
    </div>
  );
};

export default CallApp;