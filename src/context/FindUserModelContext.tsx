// context/UserContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserContextType, UserInfo, UserResponseDto, UserUpdateRequest } from '../types/user';
import { useRouter } from 'next/navigation';

interface FindUserModelContextType {
  modelOpen: boolean;
  setModelOpen: (isOpen: boolean) => void;
  userPhoneRef: React.RefObject<HTMLInputElement | null>;
}

const FindUserContext = createContext<FindUserModelContextType | undefined>(undefined);

export const FindUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [modelOpen, setModelOpen] = useState(false);
  // const [userPhone, setUserPhone] = useState<string | null>(null);
  const userPhoneRef = useRef<HTMLInputElement>(null);



  const value: FindUserModelContextType = {
    modelOpen,
    setModelOpen,
    userPhoneRef
  };

  return <FindUserContext.Provider value={value}>{children}</FindUserContext.Provider>;
};

export const useFindUser = () => {
  const context = useContext(FindUserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};