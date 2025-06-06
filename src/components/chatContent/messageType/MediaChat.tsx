import { MessageResponse } from '@/types/chat';
import React from 'react';

const MediaChat: React.FC<{ message: MessageResponse }> = ({ message }) => {
  // Hàm kiểm tra loại file dựa trên mediaUrl hoặc content
  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
  const isVideo = (url: string) => /\.(mp4|ogg|mov|avi|mkv)$/i.test(url);
  const isAudio = (url: string) => /\.(mp3|wav|ogg|m4a|aac|flac|mpeg|webm)$/i.test(url);

  // URL của media
  const mediaUrl = message.mediaUrl || message.content;

  if (message.type !== 'MEDIA' || !mediaUrl) {
    return <span>Không có nội dung media</span>;
  }

  if (isImage(mediaUrl)) {
    return (
      <img
        src={mediaUrl}
        alt="Media"
        className="max-w-xs rounded-lg"
        style={{ maxHeight: '300px', objectFit: 'cover' }}
      />
    );
  }

  if (isVideo(mediaUrl)) {
    return (
      <video
        src={mediaUrl}
        controls
        className="max-w-xs rounded-lg"
        style={{ maxHeight: '300px' }}
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  if (isAudio(mediaUrl)) {
    return (
      <audio
        src={mediaUrl}
        controls
        className="max-w-xs"
      >
        Your browser does not support the audio tag.
      </audio>
    );
  }

  // Fallback nếu không nhận diện được loại media
  return <span>Media không hỗ trợ</span>;
};

export default MediaChat;