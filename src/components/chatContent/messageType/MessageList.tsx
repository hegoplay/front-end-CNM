import { MessageResponse } from '@/types/chat';
import React, { useCallback } from 'react'
import MyMessageContent from './MyMessageContent';
import OtherMessageContent from './OtherMessageContent';
import TextChat from './TextChat';
import { UserResponseDto } from '@/types/user';
import useSocket from '@/hooks/useSocket';
import { useUser } from '@/context/UserContext';

interface MessageListProps {
  messages: MessageResponse[];
  currentUserPhone: string;
  otherInfo?: UserResponseDto; 
}

const MessageList : React.FC<MessageListProps> = ({...props}) => {

  const{userInfo} = useUser();

  // console.log("userInfo", userInfo);

  const messageType = useCallback((message: MessageResponse) => {
    // xử lý tin nhắn thu hồi trước
    if (message.isRecalled) {
      return <span className="text-gray-500">Tin nhắn đã thu hồi</span>
    }
    switch (message.type) {
      case "TEXT":
        return <TextChat message={message} />
      default:
        return <TextChat message={message}/>
    }
  }, [props.currentUserPhone, props.messages]);

  const messageWrapper = useCallback((message: MessageResponse) => {
    if (message.senderId === props.currentUserPhone) {
      return <MyMessageContent key={message.id} message={message} userInfo={userInfo || undefined}>
        {messageType(message)}
      </MyMessageContent>
    } else {
      return <OtherMessageContent key={message.id} message={message} userInfo={props.otherInfo || undefined}>
        {messageType(message)}
      </OtherMessageContent>
    }
  }
  , [props.currentUserPhone, props.messages]);

  // const messageType = (message: MessageResponse) => {
  //   // xử lý tin nhắn thu hồi trước
  //   if (message.isRecalled) {
  //     return <span className="text-gray-500">Tin nhắn đã thu hồi</span>
  //   }
  //   switch (message.type) {
  //     case "TEXT":
  //       return <TextChat message={message} />
  //     default:
  //       return <TextChat message={message}/>
  //   }
  // };

  // const messageWrapper = (message: MessageResponse) => {
  //   if (message.senderId === props.currentUserPhone) {
  //     return <MyMessageContent key={message.id} message={message} userInfo={userInfo || undefined}>
  //       {messageType(message)}
  //     </MyMessageContent>
  //   } else {
  //     return <OtherMessageContent key={message.id} message={message} userInfo={props.otherInfo || undefined}>
  //       {messageType(message)}
  //     </OtherMessageContent>
  //   }
  // };

  return (
    props.messages.length > 0 ? (
      <div className="flex flex-col w-full h-full overflow-y-auto">
        {props.messages.map((message) => (
          <div key={message.id} className={`flex ${message.senderId === props.currentUserPhone ? "justify-end" : "justify-start"} mb-2 gap-4`}>
            {messageWrapper(message)}
          </div>
        ))}
      </div>
    ) : (
      <div className="flex items-center justify-center h-full text-gray-500">
        Chưa có tin nhắn nào
      </div>
    )
  )
}

export default MessageList