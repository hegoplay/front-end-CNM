import React, { useMemo } from 'react';
import IconButton from '../IconButton';
import { IoPersonAddOutline } from 'react-icons/io5';
import { CiVideoOn } from 'react-icons/ci';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Spin } from 'antd';
import { useOtherUserInfo } from '@/hooks/useOtherUserInfo';
import { useUser } from '@/context/UserContext';
import { UserResponseDto } from '@/types/user';

const ConversationDetailPrivatePageHeader: React.FC<{ otherInfo?: UserResponseDto}> = ({ otherInfo }) => {
  

  // Sử dụng useMemo cho các phần JSX phức tạp có thể tái sử dụng
  const actionButtons = useMemo(() => (
    <div className="flex items-center gap-3">
      <IconButton
        icon={<IoPersonAddOutline style={{ fontSize: 20, color: "black" }} />}
        onClick={() => {}}
        selected={false}
        className="bg-white hover:bg-gray-200"
        size="sm"
      />
      <IconButton
        icon={<CiVideoOn style={{ fontSize: 20, color: "black" }} />}
        onClick={() => {}}
        selected={false}
        className="bg-white hover:bg-gray-200"
        size="sm"
      />
      <IconButton
        icon={<FaMagnifyingGlass style={{ fontSize: 20, color: "black" }} />}
        onClick={() => {}}
        selected={false}
        className="bg-white hover:bg-gray-200"
        size="sm"
      />
    </div>
  ), []);

  if (!otherInfo) {
    return <div className="flex p-3 border-b-1 border-gray-300 gap-3" />;
  }

  

  return (
    <div className="flex p-3 border-b-1 border-gray-300 gap-3">
      <img 
        src={otherInfo?.baseImg} 
        className="w-12 h-12 rounded-full" 
        alt={otherInfo?.name || 'User avatar'}
      />
      <div className="flex flex-1 flex-col justify-around">
        <span className="text-black font-semibold">{otherInfo?.name}</span>
        <span className="text-sm text-gray-500">{otherInfo?.status}</span>
      </div>
      {actionButtons}
    </div>
  );
};

export default ConversationDetailPrivatePageHeader;