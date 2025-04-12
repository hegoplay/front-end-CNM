'use client'

import UserInfoProps from '@/models/UserInfoProps'
import { userInfo } from 'os';
import React, { useLayoutEffect, useState } from 'react'

interface UserInfoFormProps {
  // Define any props if needed
  userInfo?: UserInfoProps,
  isFriend?: boolean,
  isMe?: boolean,
}

const UserInfoForm : React.FC<UserInfoFormProps> = ({...props}) => {
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(); // Ảnh hiện tại
  const [newBackgroundImageFile, setNewBackgroundImageFile] = useState<File | null>(null); // File ảnh mới

  useLayoutEffect(() => {
    if (props.userInfo) {
      setBackgroundImage(props.userInfo.backgroundImg);
    }
  }, [props.userInfo]);


  return (
    <form className='flex flex-col '>
      <img src={backgroundImage} className='w-screen h-40'/>
    </form>
  )
}

export default UserInfoForm