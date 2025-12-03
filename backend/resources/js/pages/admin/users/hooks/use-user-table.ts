import { PageProps } from '@/types/user';
import { router, usePage } from '@inertiajs/react';
import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { columns } from '../components/user-table';

export function useUserTable() {
    const { users, filters } = usePage().props as unknown as PageProps;
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [perPage, setPerPage] = useState(filters.per_page || 10);

    const table = useReactTable({
        data: users.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        pageCount: users.last_page,
        state: {
            pagination: {
                pageIndex: users.current_page - 1,
                pageSize: perPage,
            },
        },
        onPaginationChange: (updater) => {
            const newPagination =
                typeof updater === 'function'
                    ? updater(table.getState().pagination)
                    : updater;
            router.get('/admin/users', {
                page: newPagination.pageIndex + 1,
                per_page: newPagination.pageSize,
                search,
                role,
            });
        },
    });

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/admin/users', {
            page: 1,
            per_page: perPage,
            search: value,
            role,
        });
    };

    const handlePerPageChange = (value: string) => {
        const newPerPage = parseInt(value);
        setPerPage(newPerPage);
        router.get('/admin/users', {
            page: 1,
            per_page: newPerPage,
            search,
            role,
        });
    };

    const handleRoleChange = (value: string) => {
        setRole(value);
        router.get('/admin/users', {
            page: 1,
            per_page: perPage,
            search,
            role: value,
        });
    };

    return {
        table,
        search,
        role,
        perPage,
        handleSearch,
        handleRoleChange,
        handlePerPageChange,
    };
}
