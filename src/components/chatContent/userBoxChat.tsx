import { useUser } from "@/context/UserContext";
import { ConversationDto } from "@/types/chat";
import { UserResponseDto } from "@/types/user";
import React, { useLayoutEffect, useMemo } from "react";
import axios from "axios";


interface UserBoxChatProps {
  id?: string;
}

const UserBoxChat : React.FC<ConversationDto> = ({...props}) => {
  
  const {userInfo}= useUser();
  const [otherInfo, setOtherInfo] = React.useState<UserResponseDto | undefined>(undefined);
  useLayoutEffect(() => {
    const otherPhone = props.participants.find((participant) => participant !== userInfo?.phoneNumber);
    fetch(`/api/users/get-info/${otherPhone}`, {
      method: "GET",
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setOtherInfo(data.message);
      } else {
        console.error("Error fetching user info:", data.message);
      }
    })
      .catch((error) => {
        console.error("Error fetching user info:", error);
    });
  },[])
  
  const handleOnPress = useMemo(() => {
    return async () => {
      // Handle the click event here
      const res = await axios.get(`/api/conversations/initialize/${props.id}`);
      if (res.status === 200) {
        // console.log(res.data)
        // Handle successful response
      } else {
        console.error("Error initializing conversation:", res.data);
      }
    };
  }
  , []);
  
  return (
    <div className="flex items-center bg-transparent cursor-pointer hover:bg-gray-200 p-3" id={props.id} key={props.id} onClick={handleOnPress}>
      <img src={otherInfo?.baseImg || '/avatar.jpg'} className="w-10 h-10 rounded-full mr-2" />
      <div className="flex flex-col">
        <span className="text-black">{otherInfo ? otherInfo.name : "Loading..."}</span>
        <span className="text-sm text-gray-500">{(props.messages && props.messages.length > 0 ) ? props.messages[-1] : "..."}</span>
      </div>
    </div>
  );
};

export default UserBoxChat;
