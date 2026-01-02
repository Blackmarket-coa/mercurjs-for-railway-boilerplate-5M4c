import { Cart } from '@/components/sections';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review your shopping cart',
};

function CartSkeleton() {
  return (
    <>
      <div className="col-span-12 lg:col-span-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 p-4 border rounded-sm animate-pulse">
            <div className="w-24 h-24 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-2" />
      <div className="col-span-12 lg:col-span-4">
        <div className="border rounded-sm p-4 space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded mt-4" />
        </div>
      </div>
    </>
  );
}

export default function CartPage({}) {
  return (
    <main className='container grid grid-cols-12 gap-6 py-6'>
      <Suspense fallback={<CartSkeleton />}>
        <Cart />
      </Suspense>
    </main>
  );
}
