import FormForgot from '@/components/noAuth/forgot-password/formForgot'
import FormLogin from '@/components/noAuth/login/formLogin'
import LoginBox from '@/components/noAuth/login/loginBox'
import React from 'react'

const ForgotPasswordPage = () => {
  return (
    <div className="h-screen w-screen bg-blue-100 justify-center items-center flex flex-col">
      <h3 className='text-black'>Zala</h3>
      <p className='text-black'>Đăng nhập tài khoản vào Zala</p>
      <LoginBox renderForm={<FormForgot/>} title='Đăng nhập'/>
    </div>
  )
}

export default ForgotPasswordPage