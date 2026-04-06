import Image from "next/image"

interface LogoProps {
  size?: number
  className?: string
  color?: string
}

export function Logo({ size = 50, className }: LogoProps) {
  return (
    <Image
      src="/images/Logo.png"
      alt="Neighbor Connector Logo"
      width={size}
      height={size}
      className={className}
    />
  )
}
