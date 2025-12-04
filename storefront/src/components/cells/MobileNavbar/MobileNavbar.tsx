'use client';

import { HttpTypes } from '@medusajs/types';
import {
  CategoryNavbar,
  HeaderCategoryNavbar,
} from '@/components/molecules';
import { CloseIcon, HamburgerMenuIcon } from '@/icons';
import { useState } from 'react';

export const MobileNavbar = ({
  childrenCategories,
  parentCategories,
}: {
  childrenCategories: HttpTypes.StoreProductCategory[];
  parentCategories: HttpTypes.StoreProductCategory[];
}) => {
  const [openMenu, setOpenMenu] = useState(false);

  const closeMenuHandler = () => {
    setOpenMenu(false);
  };

  return (
    <div className='lg:hidden'>
      <div onClick={() => setOpenMenu(true)}>
        <HamburgerMenuIcon />
      </div>
      {openMenu && (
        <div className='fixed w-full h-full bg-primary p-2 top-0 left-0 z-20'>
          <div className='flex justify-end'>
            <div onClick={() => closeMenuHandler()}>
              <CloseIcon size={20} />
            </div>
          </div>
          <div className='border mt-4 rounded-sm'>
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
