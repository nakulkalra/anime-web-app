import React, { memo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import ProductForm from "./ProductForm"
import type { FormData, Category } from "./types"

interface ProductDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  form: FormData
  onFieldChange: (name: string, value: string | number) => void
  onCategoryChange: (value: string) => void
  onImagesChange: (images: string[]) => void
  onSubmit: () => void
  categories: Category[]
}

const ProductDialog = memo(
  ({
    isOpen,
    onOpenChange,
    mode,
    form,
    onFieldChange,
    onCategoryChange,
    onImagesChange,
    onSubmit,
    categories,
  }: ProductDialogProps) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Product" : "Edit Product"}</DialogTitle>
        </DialogHeader>
        <ProductForm
          form={form}
          onFieldChange={onFieldChange}
          onCategoryChange={onCategoryChange}
          onImagesChange={onImagesChange}
          categories={categories}
        />
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>{mode === "create" ? "Create Product" : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
)

ProductDialog.displayName = "ProductDialog"

export default ProductDialog

