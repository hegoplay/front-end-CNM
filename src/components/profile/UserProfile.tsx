// 'use client'
// import React from 'react'

// const UserInfoPage = () => {
//   return (
//     <div>UserInfoPage</div>
//   )
// }

// export default UserInfoPage
'use client';

import React, { useEffect, useLayoutEffect } from 'react';
import Navbar from '@/components/navbar/Navbar'; // Đảm bảo đường dẫn đúng
import { useUser } from '@/context/UserContext'; // Import context để lấy thông tin người dùng
import { useRouter } from 'next/navigation'; // Import useRouter để điều hướng
import { UserInfo, UserResponseDto } from '@/types/user';

interface Props{
  params: {
    phone: string;
  }
}

const UserProfile : React.FC<Props> = ({params}) => {
  // const { userInfo } = useUser(); // Lấy thông tin người dùng từ context
  
  const [userInfo, setUserInfo] = React.useState<UserResponseDto| null>(null);


  useLayoutEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`/api/users/get-info/${params.phone}`); // Gọi API để lấy thông tin người dùng
        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }
        const data = await response.json();
        console.log('User info:', data);
        setUserInfo(data.message); // Cập nhật state với thông tin người dùng
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo(); // Gọi hàm để lấy thông tin người dùng
  },[]);

  if (userInfo === null) {
    return (<span>Loading...</span>)
  }

      {/* Nội dung chính */}
  return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backgroundColor: '#add8e6' }}>
        <div
          style={{
            display: 'flex',
            width: '70%', // Chiếm 70% chiều rộng trang web
            height: '100%', // Chiều cao cố định
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
          }}
        >
          {/* Phần bên trái */}
          <div
            style={{
              width: '40%', // Chiếm 40% chiều rộng
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              borderRight: '1px solid #ddd', // Đường phân cách giữa hai phần
            }}
          >
            <img
              src={userInfo?.baseImg || '/default-avatar.png'} // Sử dụng ảnh từ userInfo
              alt={userInfo?.name || 'Người dùng'}
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                marginBottom: '10px',
                border: '2px solid #ddd',
              }}
            />
            <h2 style={{ margin: '10px 0', fontSize: '26px', color: '#333', textAlign: 'center' }}>
              {userInfo?.name || 'Tên người dùng'}
            </h2>
          </div>

          {/* Phần bên phải */}
          <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>Ngày sinh:</label>
              <div
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  color: '#555',
                  cursor: 'default',
                  backgroundColor: '#f9f9f9',
                }}
              >
                {userInfo?.dateOfBirth || 'Chưa cập nhật'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>Giới tính:</label>
              <div
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  color: '#555',
                  cursor: 'default',
                  backgroundColor: '#f9f9f9',
                }}
              >
                {userInfo?.male ? 'Nam' : userInfo?.male === false ? 'Nữ' : 'Chưa cập nhật'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>Số điện thoại:</label>
              <div
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  color: '#555',
                  cursor: 'default',
                  backgroundColor: '#f9f9f9',
                }}
              >
                {userInfo?.phoneNumber || 'Chưa cập nhật'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>Bio:</label>
              <div
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  color: '#555',
                  cursor: 'default',
                  backgroundColor: '#f9f9f9',
                  minHeight: '80px',
                }}
              >
                {userInfo?.bio || 'Chưa cập nhật'}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default UserProfile;