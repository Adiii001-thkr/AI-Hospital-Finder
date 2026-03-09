import { Search, Package, Building } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'medicines' | 'hospitals';
  message?: string;
}

export function EmptyState({ type, message }: EmptyStateProps) {
  const icons = {
    search: Search,
    medicines: Package,
    hospitals: Building,
  };

  const defaultMessages = {
    search: 'No results found. Try adjusting your search.',
    medicines: 'No medicines available at the moment.',
    hospitals: 'No hospitals found in this area.',
  };

  const Icon = icons[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-4 rounded-2xl bg-muted mb-4">
        <Icon className="w-12 h-12 text-muted-foreground" />
      </div>
      <p className="text-lg text-muted-foreground text-center max-w-md">
        {message || defaultMessages[type]}
      </p>
    </div>
  );
}
