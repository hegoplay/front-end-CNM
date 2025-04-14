import { MessageResponse } from '@/types/chat';
import React from 'react';

const FileChat: React.FC<{ message: MessageResponse }> = ({ message }) => {
  // URL của file
  const fileUrl = message.mediaUrl || message.content;

  if (message.type !== 'FILE' || !fileUrl) {
    return <span>Không có tệp đính kèm</span>;
  }

  // Lấy tên file từ URL hoặc content
  const fileName = fileUrl.split('/').pop() || 'Tệp đính kèm';

  return (
    <a
      href={fileUrl}
      download
      className="flex items-center text-blue-white hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 10v6m0 0l-3-3m3 3l3-3m-6 3V4m6 0H6m6 14h6a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      {fileName}
    </a>
  );
};

export default FileChat;