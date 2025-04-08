import FormRegister from '@/components/register/formRegister'
import LoginBox from '@/components/login/loginBox'
import React from 'react'

const RegisterPage = () => {


  return (
    <div className="h-screen w-screen bg-blue-100 justify-center items-center flex flex-col">
      <h3 className='text-black'>Zala</h3>
      <p className='text-black'>Đăng ký tài khoản</p>
      <LoginBox renderForm={<FormRegister/>} title='Đăng ký tài khoản'/>
    </div>
  )
}

export default RegisterPage