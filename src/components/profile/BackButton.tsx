'use client'
import { useRouter } from 'next/navigation';
import React from 'react'

const BackButton = () => {
  const router = useRouter(); // Sử dụng useRouter để điều hướng
  return (
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
  )
}

export default BackButton