import type React from "react"
import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FormInputProps {
  label: string
  type?: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  name: string
  placeholder: string
}

const FormInput = memo(({ label, type = "text", value, onChange, name, placeholder }: FormInputProps) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label}</Label>
    <Input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full"
    />
  </div>
))

FormInput.displayName = "FormInput"

export default FormInput

