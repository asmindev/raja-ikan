import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface OrdersFiltersProps {
    search: string;
    status: string;
    perPage: number;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onPerPageChange: (value: string) => void;
}

export function OrdersFilters({
    search,
    status,
    perPage,
    onSearchChange,
    onStatusChange,
    onPerPageChange,
}: OrdersFiltersProps) {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search order ID or customer name..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-10 pl-10"
                    />
                </div>
                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger className="h-10 w-32">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="delivering">Delivering</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={perPage.toString()}
                    onValueChange={onPerPageChange}
                >
                    <SelectTrigger className="h-10 w-24">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    );
}
