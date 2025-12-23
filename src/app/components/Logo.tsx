"use client"

interface LogoProps {
  size?: "sm" | "md" | "lg"
}

export default function Logo({ size = "md" }: LogoProps) {
  const textSizes = {
    sm: "text-base sm:text-lg",
    md: "text-lg sm:text-xl md:text-2xl",
    lg: "text-xl sm:text-2xl md:text-3xl",
  }

  const fontWeights = {
    sm: "font-bold",
    md: "font-extrabold",
    lg: "font-black",
  }

  return (
    <span
      className={`${textSizes[size]} ${fontWeights[size]} bg-gradient-to-r from-primary to-secondary text-gradient tracking-tight`}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      Celengan
    </span>
  )
}
