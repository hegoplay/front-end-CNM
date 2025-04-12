import Navbar from '@/components/navbar/Navbar'
import React from 'react'

const SettingLayout : React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <>
    <Navbar/>
    {children}
    </>
  )
}

export default SettingLayout