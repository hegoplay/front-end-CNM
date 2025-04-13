import { Image } from 'antd'
import React from 'react'

const AvatarImg : React.FC<{imgUrl: string}>= ({imgUrl}) => {
  return (
    <Image style={{width:48, height: 48, borderRadius: "50%"}} src={imgUrl}></Image>
  )
}

export default AvatarImg