import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-4 space-y-4 shadow-sm">
      <div className="aspect-[3/4] w-full rounded-xl skeleton-shimmer" />
      <div className="space-y-2">
        <div className="h-3 w-1/3 rounded skeleton-shimmer" />
        <div className="h-4 w-3/4 rounded skeleton-shimmer" />
        <div className="h-5 w-1/2 rounded skeleton-shimmer pt-2" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
