import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { FilterOptions, Category } from "../../types/product"

interface FilterSidebarProps {
  categories: Category[]
  onFilterChange: (filters: FilterOptions) => void
}

export function FilterSidebar({ categories, onFilterChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    stockStatus: [],
  })

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  return (
    <div className="w-64 p-4 border-r">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Category</h3>
        {categories.map((category) => (
          <div key={category.id} className="flex items-center mb-2">
            <Checkbox
              id={`category-${category.id}`}
              checked={filters.category === category.id}
              onCheckedChange={(checked) => handleFilterChange({ category: checked ? category.id : undefined })}
            />
            <label htmlFor={`category-${category.id}`} className="ml-2 text-sm">
              {category.name}
            </label>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Price Range</h3>
        <Slider
          min={0}
          max={1000}
          step={10}
          value={[filters.minPrice || 0, filters.maxPrice || 1000]}
          onValueChange={([min, max]) => handleFilterChange({ minPrice: min, maxPrice: max })}
        />
        <div className="flex justify-between mt-2">
          <span>${filters.minPrice || 0}</span>
          <span>${filters.maxPrice || 1000}</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Availability</h3>
        <div className="flex items-center mb-2">
          <Checkbox
            id="in-stock"
            checked={filters.stockStatus?.includes("in_stock")}
            onCheckedChange={(checked) => {
              const updatedStockStatus = checked
                ? [...(filters.stockStatus || []), "in_stock"]
                : (filters.stockStatus || []).filter(status => status !== "in_stock")
              handleFilterChange({ stockStatus: updatedStockStatus })
            }}
          />
          <label htmlFor="in-stock" className="ml-2 text-sm">
            In Stock
          </label>
        </div>
      </div>

      <Button
        onClick={() => {
          setFilters({})
          onFilterChange({})
        }}
        variant="outline"
        className="w-full"
      >
        Clear Filters
      </Button>
    </div>
  )
}

