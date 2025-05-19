"use client";

import { MessageResponse } from "@/types/chat";
import { UserResponseDto } from "@/types/user";
import { Input, Button, Empty, Spin, List, Avatar } from "antd";
import { useEffect, useState } from "react";
import { FaSearch, FaTimes, FaChevronUp, FaChevronDown } from "react-icons/fa";

interface MessageSearchProps {
  messages: MessageResponse[];
  onClose: () => void;
  userInfo?: UserResponseDto;
  otherUserInfo?: UserResponseDto;
  onScrollToMessage: (messageId: string) => void;
}

const MessageSearch: React.FC<MessageSearchProps> = ({
  messages,
  onClose,
  userInfo,
  otherUserInfo,
  onScrollToMessage,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<MessageResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Search functionality
  const performSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const term = searchTerm.toLowerCase();

    // Filter messages that contain the search term
    const results = messages.filter((message) => {
      // Only search in text messages
      if (message.type !== "TEXT" || message.isRecalled) return false;
      
      return message.content?.toLowerCase().includes(term);
    });

    setSearchResults(results);
    setIsSearching(false);
    setSelectedIndex(results.length > 0 ? 0 : -1);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Navigate to previous/next result
  const navigateToPrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      onScrollToMessage(searchResults[selectedIndex - 1].id);
    }
  };

  const navigateToNext = () => {
    if (selectedIndex < searchResults.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      onScrollToMessage(searchResults[selectedIndex + 1].id);
    }
  };

  // Handle pressing Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch();
    }
  };

  // When a result is clicked
  const handleResultClick = (messageId: string, index: number) => {
    setSelectedIndex(index);
    onScrollToMessage(messageId);
  };

  // Format the timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Truncate message content for preview
  const truncateMessage = (content: string, maxLength = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Auto-search when search term changes
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch();
      }
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  return (
    <div className="bg-white border-l border-gray-300 w-80 h-full flex flex-col">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium">Tìm kiếm tin nhắn</h3>
        <Button
          type="text"
          icon={<FaTimes />}
          onClick={onClose}
          className="hover:bg-gray-100"
        />
      </div>
      
      <div className="p-3 border-b border-gray-200">
        <Input
          placeholder="Tìm kiếm tin nhắn..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          prefix={<FaSearch className="text-gray-400" />}
          suffix={
            searchTerm && (
              <FaTimes 
                className="text-gray-400 cursor-pointer" 
                onClick={() => setSearchTerm("")}
              />
            )
          }
        />
      </div>
      
      {isSearching ? (
        <div className="flex-1 flex items-center justify-center">
          <Spin size="large" />
        </div>
      ) : searchResults.length > 0 ? (
        <>
          <div className="flex-1 overflow-auto">
            <List
              dataSource={searchResults}
              renderItem={(item, index) => (
                <List.Item
                  onClick={() => handleResultClick(item.id, index)}
                  className={`cursor-pointer hover:bg-gray-100 p-2 ${
                    index === selectedIndex ? "bg-blue-50" : ""
                  }`}
                  style={{
                    paddingRight: "12px",
                    paddingLeft: "12px",
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      // <div className="pl-2">
                      <Avatar
                        src={
                          item.senderId === userInfo?.phoneNumber
                            ? userInfo?.baseImg
                            : otherUserInfo?.baseImg || "/default-avatar.png"
                        }
                      />
                      // </div>
                    }
                    title={
                      <div className="flex justify-between">
                        <span>
                          {item.senderId === userInfo?.phoneNumber
                            ? "Bạn"
                            : otherUserInfo?.name || "Người dùng khác"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>
                    }
                    description={truncateMessage(item.content || "")}
                  />
                </List.Item>
              )}
            />
          </div>
          
          <div className="p-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {selectedIndex + 1}/{searchResults.length} kết quả
            </span>
            <div className="flex gap-2">
              <Button
                icon={<FaChevronUp />}
                onClick={navigateToPrevious}
                disabled={selectedIndex <= 0}
              />
              <Button
                icon={<FaChevronDown />}
                onClick={navigateToNext}
                disabled={selectedIndex >= searchResults.length - 1}
              />
            </div>
          </div>
        </>
      ) : searchTerm ? (
        <div className="flex-1 flex items-center justify-center">
          <Empty description="Không tìm thấy tin nhắn" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <FaSearch size={36} className="mb-2" />
          <p>Nhập từ khóa để tìm kiếm tin nhắn</p>
        </div>
      )}
    </div>
  );
};

export default MessageSearch;