import { MessageResponse } from '@/types/chat'
import React from 'react'

const TextChat : React.FC<{message: MessageResponse}> = ({message}) => {
  return (
    <span>{message.content}</span>
  )
}

export default TextChat