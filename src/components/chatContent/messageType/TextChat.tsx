import { MessageResponse } from '@/types/chat'
import React from 'react'

const TextChat : React.FC<{message: MessageResponse}> = ({message}) => {
  return (
    <span
      style={{
        whiteSpace: 'normal', // Cho phép xuống dòng tự nhiên
        wordWrap: 'break-word', // Xuống dòng khi từ quá dài
        overflowWrap: 'break-word', // Tương tự word-wrap, đảm bảo tương thích
      }}
    >
      {message.content}
    </span>
  )
}

export default TextChat