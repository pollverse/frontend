import { useMemo, useState } from 'react';
import { useGovernorFactory } from '@/hooks/useGovernorFactory';
import { GovernorFactory_Address } from '@/lib/addresses';

interface DAO {
  governor: string;
  timelock: string;
  treasury: string;
  token: string;
  tokenType: number;
  createdAt: number;
  name?: string;
  description?: string;
  status?: 'active' | 'new' | 'trending';
  category?: string;
  tags?: string[];
}

export const useDAOFilters = ({
  searchQuery = '',
  selectedCategory = 'all',
  selectedStatus = [],
  allDAOs = [],
  isLoading = false,
}: {
  searchQuery: string;
  selectedCategory: string;
  selectedStatus: string[];
  allDAOs: DAO[];
  isLoading: boolean;
}) => {

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid

  const filteredDAOs = useMemo(() => {
    if (isLoading) return [];
    
    return allDAOs.filter(dao => {
      // Filter by category
      if (selectedCategory !== 'all' && dao.category !== selectedCategory) {
        return false;
      }

      // Filter by status
      if (selectedStatus.length > 0 && dao.status && !selectedStatus.includes(dao.status)) {
        return false;
      }

      // Filter by search query
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesName = dao.name?.toLowerCase().includes(query) || false;
        const matchesDescription = dao.description?.toLowerCase().includes(query) || false;
        const matchesTags = dao.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
        
        return matchesName || matchesDescription || matchesTags;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedStatus, allDAOs, isLoading]);

  // Get unique categories with counts
  const categoryOptions = useMemo(() => {
    if (isLoading) return [];
    
    const counts = allDAOs.reduce((acc, dao) => {
      if (dao.category) {
        acc[dao.category] = (acc[dao.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return [
      { id: 'all', label: 'All DAOs', count: allDAOs.length },
      ...Object.entries(counts).map(([category, count]) => ({
        id: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
        count,
      })),
    ];
  }, [allDAOs, isLoading]);

  // Get unique statuses with counts and colors
  const statusOptions = useMemo(() => {
    if (isLoading) return [];
    
    const counts = allDAOs.reduce((acc, dao) => {
      if (dao.status) {
        acc[dao.status] = (acc[dao.status] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const statusColors: Record<string, string> = {
      active: 'bg-green-500',
      new: 'bg-blue-500',
      trending: 'bg-purple-500',
    };

    return Object.entries(counts).map(([status, count]) => ({
      id: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      color: statusColors[status] || 'bg-gray-500',
      count,
    }));
  }, [allDAOs, isLoading]);

  // Calculate paginated DAOs
  const paginatedDAOs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDAOs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDAOs, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredDAOs.length / itemsPerPage);

  return {
    filteredDAOs,
    categoryOptions,
    statusOptions,
    totalDAOs: allDAOs.length,
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedDAOs,
    isLoading,
    setCurrentPage,
  };
};
