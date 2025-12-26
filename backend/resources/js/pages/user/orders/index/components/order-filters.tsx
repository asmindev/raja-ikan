import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

interface OrderFiltersProps {
    activeTab: string;
    searchTerm: string;
    onTabChange: (value: string) => void;
    onSearchChange: (value: string) => void;
    onSearch: () => void;
}

export function OrderFilters({
    activeTab,
    searchTerm,
    onTabChange,
    onSearchChange,
    onSearch,
}: OrderFiltersProps) {
    const statuses = [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'delivering', label: 'Delivering' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex w-full items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search order ID..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                        className="pr-8 pl-9"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => {
                                onSearchChange('');
                                onSearch();
                            }}
                            className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Button onClick={onSearch} size="icon" variant="secondary">
                    <Search className="h-4 w-4" />
                </Button>
            </div>

            {/* Status Filters - Scrollable Pills */}
            <div className="no-scrollbar w-full overflow-x-auto pb-2">
                <div className="flex min-w-max gap-2">
                    {statuses.map((status) => (
                        <Button
                            key={status.value}
                            variant={
                                activeTab === status.value
                                    ? 'default'
                                    : 'outline'
                            }
                            size="sm"
                            onClick={() => onTabChange(status.value)}
                            className={cn(
                                'rounded-full transition-all',
                                activeTab === status.value
                                    ? 'shadow-sm'
                                    : 'bg-transparent hover:bg-muted',
                            )}
                        >
                            {status.label}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
