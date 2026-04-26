export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-card">
      {/* Image skeleton */}
      <div className="relative h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
        
        {/* Address */}
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" style={{ animationDelay: "100ms" }} />
        
        {/* Price */}
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" style={{ animationDelay: "200ms" }} />
        
        {/* Hours */}
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" style={{ animationDelay: "300ms" }} />
        
        {/* Button */}
        <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse mt-4" style={{ animationDelay: "400ms" }} />
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
