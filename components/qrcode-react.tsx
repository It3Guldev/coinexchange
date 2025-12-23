"use client"

interface QRCodeSVGProps {
  value: string
  size?: number
  level?: "L" | "M" | "Q" | "H"
  includeMargin?: boolean
}

export function QRCodeSVG({ value, size = 128, level = "M", includeMargin = false }: QRCodeSVGProps) {
  // This is a simplified QR code placeholder
  // In a real implementation, you would use a proper QR code library
  return (
    <div
      className="bg-white border-2 border-gray-200 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div className="text-xs text-center p-2 font-mono break-all">
        QR Code for:
        <br />
        {value.slice(0, 20)}...
      </div>
    </div>
  )
}
