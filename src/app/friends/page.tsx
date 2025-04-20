"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar/Navbar";

const FriendPage = () => {
  const [activeTab, setActiveTab] = useState("friends"); // State để quản lý tab đang được chọn
  const [friends, setFriends] = useState([]); // State để lưu danh sách bạn bè
  const [groups, setGroups] = useState([]); // State để lưu danh sách nhóm
  const router = useRouter(); // Sử dụng useRouter để điều hướng

  // Lấy dữ liệu bạn bè
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch("/api/friends/get-friends-list"); // Thay bằng endpoint API thực tế
        if (!response.ok) {
          throw new Error("Failed to fetch friends");
        }
        const data = await response.json();
        setFriends(data.friends); // Giả sử API trả về danh sách bạn bè trong `data.friends`
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    const fetchGroups = async () => {
      try {
        const response = await fetch("/api/groups/get-groups-list"); // Thay bằng endpoint API thực tế
        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }
        const data = await response.json();
        setGroups(data.groups); // Giả sử API trả về danh sách nhóm trong `data.groups`
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchFriends();
    fetchGroups();
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Navbar chính */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Navbar />
      </div>

      {/* Nút trở về */}
      <div
        style={{
          padding: "10px",
          backgroundColor: "#ffffff",
          border: "1px solid #ddd",
        }}
      >
        <button
          onClick={() => router.back()} // Quay lại trang trước đó
          style={{
            padding: "10px 20px",
            backgroundColor: "#ffffff",
            color: "#000000",
            border: "1px solid #000000",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Trở về
        </button>
      </div>

      {/* Nội dung chính */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Menu bên trái */}
        <div
          style={{
            width: "250px",
            backgroundColor: "#f0f2f5",
            padding: "20px",
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            margin: "10px",
          }}
        >
          <h3
            style={{
              marginBottom: "20px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            ☰ Menu
          </h3>
          <div
            style={{
              marginBottom: "15px",
              fontWeight: activeTab === "friends" ? "bold" : "normal",
              cursor: "pointer",
              padding: "10px",
              borderRadius: "5px",
              backgroundColor:
                activeTab === "friends" ? "#e0e0e0" : "transparent",
            }}
            onClick={() => setActiveTab("friends")}
          >
            Danh sách bạn bè
          </div>
          <div
            style={{
              marginBottom: "15px",
              fontWeight: activeTab === "groups" ? "bold" : "normal",
              cursor: "pointer",
              padding: "10px",
              borderRadius: "5px",
              backgroundColor:
                activeTab === "groups" ? "#e0e0e0" : "transparent",
            }}
            onClick={() => setActiveTab("groups")}
          >
            Danh sách nhóm
          </div>
        </div>

        {/* Nội dung bên phải */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {activeTab === "friends" && (
            <>
              <h2>Danh sách bạn bè ({friends.length})</h2>
              <div style={{ marginTop: "20px" }}>
                {friends.map((friend, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "15px",
                      paddingBottom: "10px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {/* <img
                      src={friend.}
                      alt={friend.name}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                    <span>{friend.name}</span> */}
                  </div>
                ))}
              </div>
            </>
          )}
          {activeTab === "groups" && (
            <>
              <h2>Danh sách nhóm ({groups.length})</h2>
              {/* <div style={{ marginTop: "20px" }}>
                {groups.map((group, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "15px",
                      paddingBottom: "10px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <img
                      src={group.avatar}
                      alt={group.name}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                    <div>
                      <h3 style={{ margin: 0 }}>{group.name}</h3>
                      <p style={{ margin: 0, color: "#555" }}>
                        {group.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendPage;