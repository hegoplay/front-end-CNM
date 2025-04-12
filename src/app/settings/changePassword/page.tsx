'use client'
import LoginBox from '@/components/noAuth/login/loginBox'
import FormChangePass from '@/components/settings/FormChangePass'
import { useUser } from '@/context/UserContext'
import React from 'react'

const ChangePasswordPage : React.FC = () => {
  
  const { userInfo } = useUser();

  if (!userInfo) {
    return <div>Loading...</div>; // Hoặc một thông báo lỗi nếu không có thông tin người dùng
  }

  return (
    <div className="h-screen w-screen bg-blue-100 justify-center items-center flex flex-col">
      <h3 className='text-black'>Zala</h3>
      <p className='text-black'>Đăng nhập tài khoản vào Zala</p>
      <LoginBox renderForm={<FormChangePass phone={userInfo.phoneNumber} />} title='Thay đổi mật khẩu'/>
    </div>
  )
}

export default ChangePasswordPage