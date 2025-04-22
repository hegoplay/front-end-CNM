"use client"

import { MemberDto } from '@/types/chat'
import { UserResponseDto } from '@/types/user';
import React from 'react'

interface Props{
  memberDto : UserResponseDto;
  checked: boolean;
  onChange: () => void;
}

const MemberComponent : React.FC<Props> = ({...props}) => {
  return (
    <label
    key={props.memberDto.phoneNumber}
    style={{
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
      cursor: "pointer",
    }}
  >
    <input
      type="checkbox"
      checked={props.checked}
      onChange={ props.onChange }
      style={{ marginRight: "10px" }}
    />
    <img
      src={props.memberDto.baseImg}
      alt={props.memberDto.name}
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        marginRight: "10px",
      }}
    />
    <span>{props.memberDto.name}</span>
  </label>
  )
}

export default MemberComponent