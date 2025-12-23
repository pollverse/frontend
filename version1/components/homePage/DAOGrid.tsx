// version1/components/homePage/DAOGrid.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Users, FileText, Clock, TrendingUp, Zap, Sparkles, X, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Link from 'next/link';
import { useGovernorFactory } from '@/hooks/useGovernorFactory';
import { useGovernor } from '@/hooks/useDGPGovernor';
import { useDAOFilters } from '@/hooks/useDAOFilters';
import Image from 'next/image';
import { DAO } from '@/types/dao';

// Update the DAOCard component
const DAOCard = React.memo(({ dao }: { dao: DAO }) => {
  const { 
    proposals = [],
    isLoading: isLoadingProposals,
    error: proposalsError 
  } = useGovernor(dao.address as `0x${string}`);

  const activeProposals = useMemo(() => {
    return proposals.filter((p: any) => p.state === 1); // 1 = Active state
  }, [proposals]);

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
                  {dao.logo ? (
                    <Image 
                      src={dao.logo} 
                      alt={dao.name} 
                      width={48} 
                      height={48} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-xl font-medium">
                      {dao.name.charAt(0)}
                    </span>
                  )}
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
                {isLoadingProposals ? '...' : proposals.length}
              </dd>
            </div>
            <div className="text-center">
              <dt className="text-sm font-medium text-gray-500">Active</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 flex items-center justify-center">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                {isLoadingProposals ? '...' : activeProposals.length}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [daos, setDaos] = useState<DAO[]>([]);

  // Use the governor factory to get all DAOs
  const { 
    governors,
    isLoading: isLoadingGovernors,
    error: governorsError 
  } = useGovernorFactory();

  // Transform governors to DAO format
  useEffect(() => {
    if (governors) {
      const mappedDaos = governors.map((governor: any, index: number) => ({
        id: `dao-${index}`,
        name: governor.name || `DAO ${index + 1}`,
        description: governor.description || 'A decentralized autonomous organization',
        category: 'governance',
        status: index % 3 === 0 ? 'trending' : index % 2 === 0 ? 'new' : 'active',
        members: Math.floor(Math.random() * 10000) + 1000,
        address: governor.address,
        tags: ['governance', 'voting', 'proposals'],
      }));
      setDaos(mappedDaos);
      setIsLoading(false);
    }
  }, [governors]);

  // Update the useDAOFilters hook to use the daos state
  const {
    filteredDAOs,
    categoryOptions,
    statusOptions,
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedDAOs,
    setCurrentPage
  } = useDAOFilters({
    daos,
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

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedStatus.length > 0) count += selectedStatus.length;
    if (searchQuery.trim() !== '') count++;
    return count;
  }, [selectedCategory, selectedStatus, searchQuery]);

  // Rest of the component remains the same...
  // [Previous JSX code for the filters and grid layout]

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search DAOs..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="space-y-2">
                {categoryOptions.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      id={`category-${category.id}`}
                      name="category"
                      type="radio"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={selectedCategory === category.id}
                      onChange={() => setSelectedCategory(category.id)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="ml-3 text-sm text-gray-700"
                    >
                      {category.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <div key={status.id} className="flex items-center">
                    <input
                      id={`status-${status.id}`}
                      name="status"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedStatus.includes(status.id)}
                      onChange={() => toggleStatus(status.id)}
                    />
                    <label
                      htmlFor={`status-${status.id}`}
                      className="ml-3 text-sm text-gray-700"
                    >
                      {status.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DAO Grid */}
      {isLoading || isLoadingGovernors ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <DAOCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedDAOs.map((dao) => (
              <DAOCard key={dao.id} dao={dao} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredDAOs.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredDAOs.length}</span> results
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <span className="sr-only">First</span>
                      <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <span className="sr-only">Last</span>
                      <ChevronsRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Error State */}
      {!isLoading && !isLoadingGovernors && governorsError && (
        <div className="text-center py-12">
          <div className="text-red-500">Error loading DAOs: {governorsError.message}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isLoadingGovernors && !governorsError && filteredDAOs.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No DAOs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || selectedCategory !== 'all' || selectedStatus.length > 0
              ? 'Try adjusting your search or filter criteria'
              : 'There are currently no DAOs available.'}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(DAOGrid);