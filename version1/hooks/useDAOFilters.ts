import { useMemo, useState } from 'react';
import { dummyDAOs } from '@/lib/daoData';

export const useDAOFilters = ({
  searchQuery = '',
  selectedCategory = 'all',
  selectedStatus = [],
}: {
  searchQuery: string;
  selectedCategory: string;
  selectedStatus: string[];
}) => {

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid

  const filteredDAOs = useMemo(() => {
    return dummyDAOs.filter(dao => {
      // Filter by category
      if (selectedCategory !== 'all' && dao.category !== selectedCategory) {
        return false;
      }

      // Filter by status
      if (selectedStatus.length > 0 && !selectedStatus.includes(dao.status)) {
        return false;
      }

      // Filter by search query
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        return (
          dao.name.toLowerCase().includes(query) ||
          dao.description.toLowerCase().includes(query) ||
          dao.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  // Get unique categories with counts
  const categoryOptions = useMemo(() => {
    const counts = dummyDAOs.reduce((acc, dao) => {
      acc[dao.category] = (acc[dao.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { id: 'all', label: 'All DAOs', count: dummyDAOs.length },
      ...Object.entries(counts).map(([category, count]) => ({
        id: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
        count,
      })),
    ];
  }, []);

  // Get unique statuses with counts and colors
  const statusOptions = useMemo(() => {
    const counts = dummyDAOs.reduce((acc, dao) => {
      acc[dao.status] = (acc[dao.status] || 0) + 1;
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
  }, []);

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
    totalDAOs: dummyDAOs.length,
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedDAOs,
    setCurrentPage
  };
};
