import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

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
    return (
        <div className="flex flex-col gap-4 md:flex-row">
            <Tabs value={activeTab} onValueChange={onTabChange}>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="delivering">Delivering</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex flex-1 gap-2 md:max-w-md">
                <Input
                    placeholder="Search by order ID..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                />
                <Button onClick={onSearch}>
                    <Search className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
