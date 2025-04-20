// 'use client'
// import React from 'react'

// const UserInfoPage = () => {
//   return (
//     <div>UserInfoPage</div>
//   )
// }

// export default UserInfoPage
'use client';

import React from 'react';
import Navbar from '../../../components/navbar/Navbar'; // Đảm bảo đường dẫn đúng
import { useUser } from '@/context/UserContext'; // Import context để lấy thông tin người dùng
import { useRouter } from 'next/navigation'; // Import useRouter để điều hướng

const UserInfoPage = () => {
  const { userInfo } = useUser(); // Lấy thông tin người dùng từ context
  const router = useRouter(); // Sử dụng useRouter để điều hướng

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      {/* Navbar chính */}
      <div style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Navbar /> {/* Navbar đã tự động hiển thị thông tin người dùng */}
      </div>

      {/* Nút trở về */}
      <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center' }}>
        <button
          onClick={() => router.back()} // Quay lại trang trước đó
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '1px solid #000000',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Trở về
        </button>
        <h1 style={{margin: '0 20px' }}>Thông tin người dùng</h1>
      </div>

      {/* Nội dung chính */}
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
                {userInfo?.isMale ? 'Nam' : userInfo?.isMale === false ? 'Nữ' : 'Chưa cập nhật'}
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
    </div>
  );
};

export default UserInfoPage;