import React from 'react'

const SectionBox : React.FC<{children?: React.ReactElement, className?: string}> = ({children, className}) => {
  return (
    <div className={` flex flex-col bg-white p-3 ${className}` }>{children}</div>
  )
}

export default SectionBox