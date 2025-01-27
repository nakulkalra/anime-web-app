import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <Button variant="outline" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </Button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button variant="outline" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
      </Button>
    </div>
  )
}

