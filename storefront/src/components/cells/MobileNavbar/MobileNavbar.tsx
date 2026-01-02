'use client';

import { HttpTypes } from '@medusajs/types';
import {
  CategoryNavbar,
  HeaderCategoryNavbar,
} from '@/components/molecules';
import { CloseIcon, HamburgerMenuIcon, SearchIcon } from '@/icons';
import { useState } from 'react';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { useRouter } from 'next/navigation';

export const MobileNavbar = ({
  childrenCategories,
  parentCategories,
}: {
  childrenCategories: HttpTypes.StoreProductCategory[];
  parentCategories: HttpTypes.StoreProductCategory[];
}) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const closeMenuHandler = () => {
    setOpenMenu(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/categories?query=${encodeURIComponent(searchQuery)}`);
      closeMenuHandler();
    }
  };

  return (
    <div className='lg:hidden'>
      <button 
        onClick={() => setOpenMenu(true)}
        aria-label="Open navigation menu"
        className="p-1"
      >
        <HamburgerMenuIcon />
      </button>
      {openMenu && (
        <div className='fixed w-full h-full bg-primary p-4 top-0 left-0 z-50 overflow-y-auto'>
          <div className='flex justify-between items-center mb-4'>
            <span className="font-semibold text-lg">Menu</span>
            <button 
              onClick={() => closeMenuHandler()}
              aria-label="Close navigation menu"
              className="p-1"
            >
              <CloseIcon size={24} />
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className='mb-4'>
            <div className='relative'>
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </form>
          
          {/* Quick Links */}
          <div className='border rounded-sm mb-4 p-4'>
            <div className='flex flex-col gap-3'>
              <LocalizedClientLink 
                href="/categories" 
                onClick={closeMenuHandler}
                className="font-medium text-primary hover:text-green-700"
              >
                🛒 Shop All Products
              </LocalizedClientLink>
              <LocalizedClientLink 
                href="/producers" 
                onClick={closeMenuHandler}
                className="font-medium text-primary hover:text-green-700"
              >
                👨‍🌾 Our Producers
              </LocalizedClientLink>
              <LocalizedClientLink 
                href="/sell" 
                onClick={closeMenuHandler}
                className="font-medium text-green-700 hover:text-green-800"
              >
                ✨ Sell on FreeBlackMarket
              </LocalizedClientLink>
            </div>
          </div>

          {/* Categories */}
          <div className='border rounded-sm'>
            <div className='p-3 border-b'>
              <span className='text-sm font-medium text-gray-500 uppercase'>Categories</span>
            </div>
            <HeaderCategoryNavbar
              onClose={closeMenuHandler}
              categories={parentCategories}
            />
            <div className='border-t pt-2'>
              <CategoryNavbar
                onClose={closeMenuHandler}
                categories={childrenCategories}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
