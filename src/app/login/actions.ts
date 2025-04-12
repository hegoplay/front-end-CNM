'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface LoginState {
  error?: string;
  success?: boolean;
  phoneNumber?: string;
  redirectUrl?: string;
}

export async function loginAction(prevState: LoginState | null, formData: FormData) {
  const phoneNumber = formData.get('phoneNumber') as string;
  const password = formData.get('password') as string;
  
  if (!phoneNumber || !password) {
    return { error: 'Vui lòng nhập đầy đủ thông tin!' };
  }
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        phone: phoneNumber, 
        password 
      }),
    });
    
    // console.log(response);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }
    
    (await cookies()).set('authToken', data.token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return { 
      success: true,
      redirectUrl: '/',
      phoneNumber: data.phone,
    };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
      success: false,
      message: "",
    };
  }
}