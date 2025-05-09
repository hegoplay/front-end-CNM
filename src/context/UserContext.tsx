// context/UserContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserContextType, UserInfo, UserResponseDto, UserUpdateRequest } from '../types/user';
import { useRouter } from 'next/navigation';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Khôi phục userInfo từ localStorage khi khởi động
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo && !userInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, [userInfo]);

  // Lưu userInfo vào localStorage
  const setUserInfoAndStore = (info: UserResponseDto | null) => {
    setUserInfo(info);
    if (info) {
      localStorage.setItem('userInfo', JSON.stringify(info));
    } else {
      localStorage.removeItem('userInfo');
    }
  };

  // // Hàm đăng nhập
  const login = useCallback(async () => {
    setIsLoading(true);
    try {
      // Giả lập API call đăng nhập và lấy thông tin cơ bản
      const response = await fetch('/api/users/whoami', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Login failed');

      const data: UserResponseDto = await response.json();
      setUserInfoAndStore(data);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);


  // Hàm cập nhật thông tin
  const updateUserInfo = useCallback(async (updates: Partial<UserUpdateRequest>) => {
    if (!userInfo) throw new Error('No user logged in');
    const formData = new FormData();
    // Thêm các trường dữ liệu vào FormData
    if (updates.name) formData.append('name', updates.name);
    if (updates.isMale !== undefined) formData.append('isMale', String(updates.isMale));
    if (updates.dateOfBirth) formData.append('dateOfBirth', updates.dateOfBirth);
    if (updates.bio) formData.append('bio', updates.bio);
    if (updates.baseImg) formData.append('baseImg', updates.baseImg); // File object
    if (updates.backgroundImg) formData.append('backgroundImg', updates.backgroundImg);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/update`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update user');

      const updatedData: UserInfo = await response.json();
      setUserInfoAndStore({ ...userInfo, ...updatedData });
    } catch (error) {
      // console.error('Error updating user info:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userInfo]);

  // Hàm đăng xuất
  const logout = useCallback(() => {
    setUserInfoAndStore(null);
    router.push('/login');
  }, []);

  const value: UserContextType = {
    userInfo,
    setUserInfo: setUserInfoAndStore,
    login,
    logout,
    updateUserInfo,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};