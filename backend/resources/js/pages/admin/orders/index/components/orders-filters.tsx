import { Card, CardContent } from '@/components/ui/card';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
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
    driverId: string;
    driverOptions: ComboboxOption[];
    perPage: number;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onDriverChange: (value: string) => void;
    onPerPageChange: (value: number) => void;
}

export function OrdersFilters({
    search,
    status,
    driverId,
    driverOptions,
    perPage,
    onSearchChange,
    onStatusChange,
    onDriverChange,
    onPerPageChange,
}: OrdersFiltersProps) {
    return (
        <Card className="mb-6 border-0 p-0 shadow-none">
            <CardContent className="flex flex-col items-center gap-4 p-0 md:flex-row">
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

                <div className="w-full md:w-56">
                    <Combobox
                        options={driverOptions}
                        value={driverId}
                        onValueChange={onDriverChange}
                        placeholder="All Drivers"
                        searchPlaceholder="Search driver..."
                        emptyText="No driver found."
                        className="h-10"
                    />
                </div>
                <Select
                    value={perPage.toString()}
                    onValueChange={(value) => onPerPageChange(Number(value))}
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
