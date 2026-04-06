import Image from "next/image"
import * as React from "react"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function Logo({ size = 50, className, ...props }: LogoProps) {
  return (
    <Image
      src="/images/Logo.png"
      alt="Neighbor Connector Logo"
      width={500}
      height={500}
      className={className}
      {...props}
    />
  )
}
