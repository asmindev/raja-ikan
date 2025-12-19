import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ProductFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    isActive: string;
    onIsActiveChange: (value: string) => void;
    perPage: number;
    onPerPageChange: (value: string) => void;
}

export function ProductFilters({
    search,
    onSearchChange,
    isActive,
    onIsActiveChange,
    perPage,
    onPerPageChange,
}: ProductFiltersProps) {
    return (
        <div className="mb-4 flex items-center space-x-4 py-2">
            <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="max-w-sm"
            />
            <Select value={isActive} onValueChange={onIsActiveChange}>
                <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
            </Select>
            <Select value={perPage.toString()} onValueChange={onPerPageChange}>
                <SelectTrigger className="w-32">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
