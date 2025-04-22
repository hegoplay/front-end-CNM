import { Image } from 'antd'
import React from 'react'

const AvatarImg : React.FC<{imgUrl: string, onClick?: () => void }>= ({imgUrl, onClick}) => {
  return (
    <img style={{width:48, height: 48, borderRadius: "50%"}} src={imgUrl} onClick={onClick}></img>
  )
}

export default AvatarImg