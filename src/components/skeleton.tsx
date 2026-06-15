export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-skeleton rounded-lg ${className}`} />;
}

export function StudioSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><Skeleton className="h-10 w-48" /><Skeleton className="h-4 w-64 mt-2" /></div>
        <Skeleton className="h-12 w-28 rounded-xl" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="space-y-5">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}

export function ExploreSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="rounded-2xl overflow-hidden">
          <Skeleton className="aspect-[9/16] rounded-2xl" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function VaultSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[1,2,3,4,5,6,7,8].map(i => (
        <div key={i} className="rounded-2xl overflow-hidden">
          <Skeleton className="aspect-[9/16] rounded-2xl" />
          <div className="p-3 space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
