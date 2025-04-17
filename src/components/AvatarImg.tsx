import { Image } from 'antd'
import React from 'react'

const AvatarImg : React.FC<{imgUrl: string}>= ({imgUrl}) => {
  return (
    <img style={{width:48, height: 48, borderRadius: "50%"}} src={imgUrl}></img>
  )
}

export default AvatarImg