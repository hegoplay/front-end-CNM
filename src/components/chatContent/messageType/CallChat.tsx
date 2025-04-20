import { MessageResponse } from '@/types/chat';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { CallResponseDto } from '@/types/call';

interface CallChatProps {
  message: MessageResponse;
}

const CallChat: React.FC<CallChatProps> = ({ message }) => {
  const router = useRouter();
  const { userInfo } = useUser();

  const [callEnded, setCallEnded] = React.useState(false);

  useEffect(() => {
    const checkCallEnded = async () => {
      try {
        const response = await fetch(`/api/call/${message.callId}`,{
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        let data = await response.json();
        data = data.data as CallResponseDto;
        setCallEnded(data.status === 'ENDED');
      } catch (error) {
        console.error('Error fetching call status:', error);
      }
    };

    checkCallEnded();
  }
  , [message.callId]);
  
  if (callEnded){
    return <span className="text-gray-300">Cuộc gọi đã kết thúc</span>;
  }


  if (message.type !== 'CALL') {
    return <span>Không có thông tin cuộc gọi</span>;
  }

  const handleClick = () => {
    // Điều hướng đến trang chi tiết cuộc gọi với callId
    // Bạn có thể thay đổi route tùy theo cấu trúc routing của bạn
    router.push(`/call/${message.callId}?userPhone=${userInfo?.phoneNumber}`);
  };

  // Hiển thị nội dung mô tả cuộc gọi
  const callDescription =  'Chi tiết cuộc gọi';


  if (message.type === 'CALL' && message.isRecalled) {
    return <span className="text-gray-300">Cuộc gọi đã thu hồi</span>;
  }

  if (callEnded){
    return <span className="text-gray-300">Cuộc gọi đã </span>;
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center text-blue-500 hover:underline cursor-pointer"
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
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
      {callDescription}
    </button>
  );
};

export default CallChat;