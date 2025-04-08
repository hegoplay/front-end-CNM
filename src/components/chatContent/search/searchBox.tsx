import { Input } from 'antd'
import React from 'react'

interface SearchBoxProps {
  phoneRef?: React.RefObject<HTMLInputElement | null>;
} 

const SearchBox: React.FC<SearchBoxProps> = ({...props}) => {
  return (
    <>
      <input placeholder='Số điện thoại' className='outline-0 focus:border-blue-300 focus:border-b-1 w-full py-2' onSubmit={() =>{console.log("TEST")}} ref={props.phoneRef}/>

    </>
  )
}

export default SearchBox