// 'use client'
// import React from 'react'

// const UserInfoPage = () => {
//   return (
//     <div>UserInfoPage</div>
//   )
// }

// export default UserInfoPage
'use server';

import React from 'react';
import Navbar from '../../../components/navbar/Navbar'; // Đảm bảo đường dẫn đúng
import UserProfile from '@/components/profile/UserProfile';
import BackButton from '@/components/profile/BackButton';

interface Props{
  params: {
    phone: string;
  }
}

const UserInfoPage : React.FC<Props> = async ({params}) => {
  // const { userInfo } = useUser(); // Lấy thông tin người dùng từ context
  

  const temp = await params


  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      {/* Navbar chính */}
      <div style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Navbar /> {/* Navbar đã tự động hiển thị thông tin người dùng */}
      </div>

      {/* Nút trở về */}
      <BackButton/>

      {/* Nội dung chính */}
      
      <UserProfile params={temp} />

      {/* Phần nội dung khác */}
    </div>
  );
};

export default UserInfoPage;