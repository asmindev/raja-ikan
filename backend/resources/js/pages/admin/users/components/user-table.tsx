import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { User } from '@/types/user';
import {
    ColumnDef,
    flexRender,
    Table as TanStackTable,
} from '@tanstack/react-table';
import { Eye, Pencil } from 'lucide-react';

const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'id',
        header: '#',
        cell: ({ row, table }) => {
            // Get current page and per page from table state
            const { pageIndex, pageSize } = table.getState().pagination;
            // Calculate the actual row number across all pages
            return pageIndex * pageSize + row.index + 1;
        },
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ getValue }) => {
            const role = getValue() as string;
            return (
                <Badge className="text-xs">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'last_login',
        header: 'Last Login',
        cell: ({ getValue }) => {
            const value = getValue() as string | null;
            return value ? new Date(value).toLocaleDateString() : 'Never';
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ getValue }) =>
            new Date(getValue() as string).toLocaleDateString(),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            window.location.href = `/admin/users/${user.id}`;
                        }}
                    >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            window.location.href = `/admin/users/${user.id}/edit`;
                        }}
                    >
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                    </Button>
                </div>
            );
        },
    },
];

interface UserTableProps {
    table: TanStackTable<User>;
}

export function UserTable({ table }: UserTableProps) {
    return (
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext(),
                                      )}
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                        >
                            No results.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

export { columns };
