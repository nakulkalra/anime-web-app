import type React from "react"
import { memo, useCallback } from "react"
import FormInput from "./FormInput"
import CategorySelect from "./CategorySelect"
import type { FormData, Category } from "./types"

interface ProductFormProps {
  form: FormData
  onFieldChange: (name: string, value: string | number) => void
  onCategoryChange: (value: string) => void
  onImagesChange: (images: string[]) => void
  categories: Category[]
}

const ProductForm = memo(({ form, onFieldChange, onCategoryChange, onImagesChange, categories }: ProductFormProps) => {
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type } = e.target
      const processedValue = type === "number" ? Number(value) : value
      onFieldChange(name, processedValue)
    },
    [onFieldChange],
  )

  const handleImagesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault(); // Prevent form submission
      const { value } = e.target
      
      // Only process images when form is submitted, not on every keystroke
      if (e.type === 'change') {
        // Just update the input field value
        onFieldChange('imageUrl', value)
        return
      }
    },
    [onFieldChange],
  )
  
  const handleDeleteImage = async (imageId: number) => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/product/delete-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId }),  // Send imageId in the request body
        credentials: 'include',  // Include credentials (e.g., cookies)
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // On successful deletion, update the productImages state
          const updatedImages = form.productImages.filter((image: any) => image.id !== imageId);
          onImagesChange(updatedImages);  // Update the parent component state
          console.log("Image deleted successfully.");
        } else {
          console.error(data.error || 'Failed to delete image');
        }
      } else {
        console.error('Failed to delete image:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };
  
  
  

  return (
    <div className="space-y-4">
        <form onSubmit={(e) => e.preventDefault()}>

      <FormInput
        label="Product Name"
        name="name"
        value={form.name}
        onChange={handleInputChange}
        placeholder="Enter product name"
      />

      <FormInput
        label="Description"
        name="description"
        value={form.description}
        onChange={handleInputChange}
        placeholder="Enter product description"
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Price"
          name="price"
          type="number"
          value={form.price}
          onChange={handleInputChange}
          placeholder="0.00"
        />

        <FormInput
          label="Stock"
          name="stock"
          type="number"
          value={form.stock}
          onChange={handleInputChange}
          placeholder="0"
        />
      </div>

      <CategorySelect value={form.categoryId} onChange={onCategoryChange} categories={categories} />

      <div className="space-y-2">
  <FormInput
    label="Image URLs"
    name="imageUrl"
    value={form.imageUrl || ""}
    onChange={handleImagesChange}
    placeholder="Enter product image URLs (comma-separated)"
  />
  <div className="flex gap-2 mt-2">
    {form.productImages.length > 0 ? (
      form.productImages.map((img: any, index: number) => (
        <div key={img.id || index} className="relative group w-24 h-24"> {/* Use img.id or index if id is missing */}
          <img
            src={typeof img === "string" ? img : img.url}
            alt={typeof img === "string" ? `Product Image` : img.altText}
            className="w-full h-full object-cover rounded-lg group-hover:grayscale transition duration-200"
          />
          <button
            onClick={() => handleDeleteImage(img.id)}  // Pass img.id here
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition duration-200 rounded-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))
    ) : (
      <p className="text-gray-500">No images found</p>
    )}
  </div>
</div>
</form>

    </div>
  )
})

ProductForm.displayName = "ProductForm"

export default ProductForm

