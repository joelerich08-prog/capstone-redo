'use client'

import { useState, useMemo, useEffect } from 'react'

interface UsePaginationOptions {
  initialPage?: number
  itemsPerPage?: number
}

interface UsePaginationReturn<T> {
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
  paginatedItems: T[]
  startIndex: number
  endIndex: number
  totalItems: number
  itemsPerPage: number
  setItemsPerPage: (count: number) => void
  goToNextPage: () => void
  goToPrevPage: () => void
  goToPage: (page: number) => void
  resetPage: () => void
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { initialPage = 1, itemsPerPage: defaultItemsPerPage = 10 } = options
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPageState] = useState(defaultItemsPerPage)

  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Reset to page 1 when items per page changes
  const setItemsPerPage = (count: number) => {
    setItemsPerPageState(count)
    setCurrentPage(1)
  }

  // Reset to page 1 if current page is out of bounds
  const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages))

  const paginatedItems = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage
    return items.slice(startIndex, startIndex + itemsPerPage)
  }, [items, validCurrentPage, itemsPerPage])

  const startIndex = (validCurrentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(validCurrentPage * itemsPerPage, totalItems)

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  const resetPage = () => {
    setCurrentPage(1)
  }

  return {
    currentPage: validCurrentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    startIndex: totalItems === 0 ? 0 : startIndex,
    endIndex,
    totalItems,
    itemsPerPage,
    setItemsPerPage,
    goToNextPage,
    goToPrevPage,
    goToPage,
    resetPage,
  }
}
