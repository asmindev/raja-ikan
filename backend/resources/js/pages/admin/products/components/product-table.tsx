import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import routes from '@/routes/admin/products';
import { productApi } from '@/services/product-api';
import { Product } from '@/types/product';
import { router } from '@inertiajs/react';
import { AvatarImage } from '@radix-ui/react-avatar';
import {
    ColumnDef,
    flexRender,
    Table as TanStackTable,
} from '@tanstack/react-table';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Product Status Switch Component
function ProductStatusSwitch({ product }: { product: Product }) {
    const [isActive, setIsActive] = useState(product.is_active);
    const [isUpdating, setIsUpdating] = useState(false);

    // Sync state with prop when product changes
    useEffect(() => {
        setIsActive(product.is_active);
    }, [product.is_active]);

    const handleToggle = async (checked: boolean) => {
        toast.info('Updating product status...');
        setIsUpdating(true);
        const previousState = isActive;
        setIsActive(checked);

        try {
            const response = await productApi.toggleStatus(product.id, checked);

            if (response.success) {
                toast.success('Product status updated successfully');
                console.log('Status toggled successfully');
                console.log('response:', response);
                // Refresh the page data to get fresh sorted data
            }
        } catch (error) {
            // Revert on error
            setIsActive(previousState);
            toast.error('Failed to update product status');
            console.error('Toggle status error:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
        />
    );
}

// Product Actions Component
function ProductActions({ product }: { product: Product }) {
    const [openDelete, setOpenDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(routes.destroy.url(product), {
            onFinish: () => {
                setIsDeleting(false);
                setOpenDelete(false);
            },
        });
    };

    return (
        <div className="flex gap-1">
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.visit(routes.show.url(product))}
                className="hover:bg-blue-50"
            >
                <Eye className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.visit(routes.edit.url(product))}
                className=""
            >
                <Edit className="h-4 w-4" />
            </Button>

            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-foreground">
                                {product.name}
                            </span>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setOpenDelete(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

const columns: ColumnDef<Product>[] = [
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
        accessorKey: 'image',
        header: 'Image',
        cell: ({ getValue }) => {
            const image = getValue() as string;
            return (
                <div className="">
                    <Avatar className="rounded-lg">
                        <AvatarImage
                            // src={image}
                            alt="Product Image"
                            className="h-full w-full object-cover"
                        />
                    </Avatar>
                </div>
            );
        },
    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => (
            <p className="max-w-48 overflow-hidden text-ellipsis whitespace-nowrap">
                {getValue() as string}
            </p>
        ),
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => (
            <p className="max-w-64 overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground">
                {getValue() as string}
            </p>
        ),
    },
    {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ getValue }) => {
            const price = getValue() as number;
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
            }).format(price);
        },
    },
    {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
            const product = row.original;
            return <ProductStatusSwitch product={product} />;
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
            const product = row.original;
            return <ProductActions product={product} />;
        },
    },
];

interface ProductTableProps {
    table: TanStackTable<Product>;
}

export function ProductTable({ table }: ProductTableProps) {
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
