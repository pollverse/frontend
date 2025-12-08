"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { dummyDAOs } from '@/lib/daoData';
import { getProposalsByDAO } from '@/lib/proposalData';
import { getActiveProposals } from '@/lib/proposalData';
import { Search, Users, FileText, Clock, TrendingUp, Zap, Sparkles, X, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Link from 'next/link';
import { useDAOFilters } from '@/hooks/useDAOFilters';
import Image from 'next/image';

// Memoize the DAO card component to prevent unnecessary re-renders
const DAOCard = React.memo(({ dao }: { dao: typeof dummyDAOs[0] }) => {
  const statusBadge = useMemo(() => {
    switch (dao.status) {
      case 'trending':
        return {
          icon: <TrendingUp className="w-3.5 h-3.5 mr-1" />,
          bg: 'bg-purple-100 text-purple-800',
          border: 'border-purple-200',
          label: 'Trending'
        };
      case 'new':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 mr-1" />,
          bg: 'bg-blue-100 text-blue-800',
          border: 'border-blue-200',
          label: 'New'
        };
      default:
        return {
          icon: <Zap className="w-3.5 h-3.5 mr-1" />,
          bg: 'bg-green-100 text-green-800',
          border: 'border-green-200',
          label: 'Active'
        };
    }
  }, [dao.status]);

  const activeProposals = useMemo(() => getActiveProposals(dao.id), [dao.id]);
  const proposals = useMemo(() => getProposalsByDAO(dao.id), [dao.id]);

  const getCategoryColor = useCallback((category: string) => {
    const colors: Record<string, string> = {
      defi: 'bg-blue-100 text-blue-800',
      nft: 'bg-purple-100 text-purple-800',
      gaming: 'bg-green-100 text-green-800',
      social: 'bg-pink-100 text-pink-800',
      governance: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <Link
                  href={`/daos/${dao.id}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  aria-label={`View ${dao.name} details`}
                >
                  <span className="text-gray-500 text-xl font-medium">
                    {dao.name.charAt(0) || <Image src={dao.logo} alt={dao.name} width={48} height={48} />}
                  </span>
                </Link>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 justify-between">
                <Link
                  href={`/daos/${dao.id}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  aria-label={`View ${dao.name} details`}
                >
                  <h3 className="text-lg font-semibold text-gray-900">{dao.name}</h3>
                </Link>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.border}`}>
                  {statusBadge.icon}
                  {statusBadge.label}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{dao.description}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(dao.category)}`}>
            {dao.category.charAt(0).toUpperCase() + dao.category.slice(1)}
          </span>
          {dao.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <dt className="text-sm font-medium text-gray-500">Members</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 flex items-center justify-center">
                <Users className="h-4 w-4 mr-1 text-gray-400" />
                {(dao.members / 1000).toFixed(1)}K
              </dd>
            </div>
            <div className="text-center">
              <dt className="text-sm font-medium text-gray-500">Proposals</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 flex items-center justify-center">
                <FileText className="h-4 w-4 mr-1 text-gray-400" />
                {proposals.length}
              </dd>
            </div>
            <div className="text-center">
              <dt className="text-sm font-medium text-gray-500">Active</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 flex items-center justify-center">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                {activeProposals.length}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

DAOCard.displayName = 'DAOCard';

// Loading skeleton component
const DAOCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-pulse">
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="h-5 w-5 bg-gray-200 rounded"></div>
      </div>
      <div className="mt-4 flex space-x-2">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const DAOGrid: React.FC = () => {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    filteredDAOs,
    categoryOptions,
    statusOptions,
    // totalDAOs,
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedDAOs,
    setCurrentPage
  } = useDAOFilters({
    searchQuery,
    selectedCategory,
    selectedStatus,
  });

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Toggle status filter
  const toggleStatus = (statusId: string) => {
    setSelectedStatus(prev =>
      prev.includes(statusId)
        ? prev.filter(id => id !== statusId)
        : [...prev, statusId]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus([]);
  };

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedStatus]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedStatus.length > 0) count += selectedStatus.length;
    if (searchQuery.trim() !== '') count++;
    return count;
  }, [selectedCategory, selectedStatus, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search DAOs..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="h-4 w-4 mr-2 text-gray-500" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Category Filter */}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categoryOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedCategory(option.id)}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg border ${selectedCategory === option.id
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <span>{option.label}</span>
                      <span className="ml-2 text-xs font-medium text-gray-500">
                        {option.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => toggleStatus(status.id)}
                      className={`inline-flex items-center px-3 py-2 text-sm rounded-full border ${selectedStatus.includes(status.id)
                          ? `${status.color.replace('bg-', 'bg-opacity-20 border-')} ${status.color.replace('bg-', 'text-')}`
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${status.color} mr-2`}></span>
                      {status.label}
                      <span className="ml-1 text-xs text-gray-500">
                        ({status.count})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory !== 'all' || selectedStatus.length > 0 || searchQuery) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Active Filters</h3>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Clear all
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {categoryOptions.find(c => c.id === selectedCategory)?.label}
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-200 text-blue-800 hover:bg-blue-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedStatus.map((statusId) => {
                    const status = statusOptions.find(s => s.id === statusId);
                    if (!status) return null;
                    return (
                      <span
                        key={statusId}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color.replace('bg-', 'bg-opacity-20 ')} ${status.color.replace('bg-', 'text-')}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${status.color} mr-1`}></span>
                        {status.label}
                        <button
                          type="button"
                          onClick={() => toggleStatus(statusId)}
                          className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-opacity-30 hover:bg-opacity-40"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                  {searchQuery && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Search: {searchQuery}
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count and Pagination Top */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, filteredDAOs.length)}
          </span>{' '}
          of <span className="font-medium">{filteredDAOs.length}</span> DAOs
        </p>

        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-md text-sm font-medium ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* DAO Grid - Use paginationDAOs instead of filteredDAOs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: itemsPerPage }).map((_, i) => (
            <DAOCardSkeleton key={`skeleton-${i}`} />
          ))
        ) : paginatedDAOs.length > 0 ? (
          paginatedDAOs.map((dao) => <DAOCard key={dao.id} dao={dao} />)
        ) : (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No DAOs found</h3>
            <p className="mt-2 text-gray-500">
              Try adjusting your search or filter criteria to find what you&apos;re looking for.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination Bottom - Same as top but without the results count */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-1">
            {/* Same pagination controls as above */}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(DAOGrid);
