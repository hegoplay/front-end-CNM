interface ForgotPasswordState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function forgotAction(prevState: ForgotPasswordState | null, formData: FormData) {
  const phoneNumber = formData.get('phone') as string;
  const password = formData.get('password') as string;
  const rePassword = formData.get('rePassword') as string;
  
  if (!phoneNumber || !password || !rePassword) {
    return { error: 'Vui lòng nhập đầy đủ thông tin!' };
  }

  if (password !== rePassword) {
    return { error: 'Mật khẩu không khớp!' };
  }
  if (password.length < 6) {
    return { error: 'Mật khẩu phải có ít nhất 6 ký tự!' };
  }
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${apiUrl}/auth/forgot-password`, {
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
      throw new Error(data.message || 'Đổi mật khẩu thất bại');
    }

    return { 
      success: true,
      redirectUrl: '/login'
    };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
      success: false,
      message: "",
    };
  }
}