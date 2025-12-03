import { useDebounce } from '@/hooks/use-debounce';
import { PageProps } from '@/types/product';
import { router, usePage } from '@inertiajs/react';
import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useEffect, useRef, useState } from 'react';
import { columns } from '../components/product-table';

export function useProductTable() {
    const { products, filters } = usePage().props as unknown as PageProps;
    const [search, setSearch] = useState(filters.search || '');
    const [isActive, setIsActive] = useState(filters.is_active || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || 10);

    // Track initial mount
    const isInitialMount = useRef(true);

    // Debounce search value for API calls
    const debouncedSearch = useDebounce(search, 500);

    // Effect to trigger search when debounced value changes
    useEffect(() => {
        // Skip on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            '/admin/products',
            {
                page: 1,
                per_page: perPage,
                search: debouncedSearch,
                is_active: isActive === 'all' ? '' : isActive,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, [debouncedSearch, perPage, isActive]);

    const table = useReactTable({
        data: products.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        pageCount: products.last_page,
        state: {
            pagination: {
                pageIndex: products.current_page - 1,
                pageSize: perPage,
            },
        },
        onPaginationChange: (updater) => {
            const newPagination =
                typeof updater === 'function'
                    ? updater(table.getState().pagination)
                    : updater;

            router.get(
                '/admin/products',
                {
                    page: newPagination.pageIndex + 1,
                    per_page: newPagination.pageSize,
                    search: debouncedSearch,
                    is_active: isActive === 'all' ? '' : isActive,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
    });

    const handleSearch = (value: string) => {
        setSearch(value);
    };

    const handlePerPageChange = (value: string) => {
        const newPerPage = parseInt(value);
        setPerPage(newPerPage);
    };

    const handleIsActiveChange = (value: string) => {
        setIsActive(value);
    };

    return {
        table,
        search,
        isActive,
        perPage,
        handleSearch,
        handleIsActiveChange,
        handlePerPageChange,
    };
}
