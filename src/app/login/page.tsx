import React from 'react'
import LoginBox from '@/components/login/loginBox'
import FormLogin from '@/components/login/formLogin'

const LoginPage = () => {
  return (
    <div className="h-screen w-screen bg-blue-100 justify-center items-center flex flex-col">
      <h3 className='text-black'>Zala</h3>
      <p className='text-black'>Đăng nhập tài khoản vào Zala</p>
      <LoginBox renderForm={<FormLogin/>} title='Đăng nhập'/>
    </div>
  )
}

export default LoginPage