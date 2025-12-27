import React from 'react';

export const SkeletonCard = () => {
    return (
        <div className="bg-white/5 rounded-xl p-4 overflow-hidden animate-pulse">
            <div className="aspect-square w-full bg-white/10 rounded-lg mb-4" />
            <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
    );
};

export const GridSkeleton = ({ count = 10 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
};

export const HomeSkeleton = () => {
    return (
        <div className="space-y-12">
            {[1, 2, 3].map((section) => (
                <div key={section} className="animate-pulse">
                    {/* Header */}
                    <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-6">
                        <div className="h-8 bg-white/10 rounded w-32" />
                        <div className="h-4 bg-white/10 rounded w-16" />
                    </div>

                    {/* Chips */}
                    <div className="flex gap-2 pb-2 mb-6 overflow-hidden">
                        {[1, 2, 3, 4, 5].map((chip) => (
                            <div key={chip} className="h-8 w-20 bg-white/10 rounded-full flex-shrink-0" />
                        ))}
                    </div>

                    {/* Grid */}
                    <GridSkeleton count={5} />
                </div>
            ))}
        </div>
    );
};
