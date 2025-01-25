import React, { memo } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category } from "./types";

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  categories: Category[]
}

const CategorySelect = memo(({ value, onChange, categories }: CategorySelectProps) => (
  <div className="space-y-2">
    <Label htmlFor="category">Category</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id.toString()}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
))

CategorySelect.displayName = "CategorySelect"

export default CategorySelect

