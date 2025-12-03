import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface UserFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    role: string;
    onRoleChange: (value: string) => void;
    perPage: number;
    onPerPageChange: (value: string) => void;
}

export function UserFilters({
    search,
    onSearchChange,
    role,
    onRoleChange,
    perPage,
    onPerPageChange,
}: UserFiltersProps) {
    return (
        <div className="mb-4 flex items-center space-x-4">
            <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="max-w-sm"
            />
            <Select value={role} onValueChange={onRoleChange}>
                <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
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
