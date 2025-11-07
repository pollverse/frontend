// components/ui/CustomButton.tsx
"use client"

import React from "react"

interface CustomButtonProps {
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "secondary"
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  disabled,
  variant = "primary",
  icon,
  iconPosition = "left",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-[12px]
        font-medium transition-all duration-150 ease-in-out
        h-11 min-w-[120px] px-5 text-[0.9375rem]
        ${
          variant === "primary"
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
        }
        disabled:opacity-60 disabled:cursor-not-allowed
      `}
    >
      {iconPosition === "left" && icon}
      {label}
      {iconPosition === "right" && icon}
    </button>
  )
}
