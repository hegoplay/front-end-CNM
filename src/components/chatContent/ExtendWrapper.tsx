import React from 'react'

const ExtendWrapper : React.FC<{children: React.ReactElement | React.ReactElement[]}> = ({children}) => {
  return (
    <div className="flex flex-col w-80 overflow-y-scroll bg-gray-100 border-1 border-gray-200 gap-2">{children}</div>
  )
}

export default ExtendWrapper