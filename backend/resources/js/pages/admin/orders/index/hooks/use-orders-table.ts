import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface UseOrdersTableProps {
    initialSearch?: string;
    initialStatus?: string;
    initialDriverId?: string;
    initialPerPage?: number;
}

export function useOrdersTable({
    initialSearch = '',
    initialStatus = '',
    initialDriverId = '',
    initialPerPage = 10,
}: UseOrdersTableProps = {}) {
    const [search, setSearch] = useState(initialSearch);
    const [status, setStatus] = useState(initialStatus);
    const [driverId, setDriverId] = useState(initialDriverId);
    const [perPage, setPerPage] = useState(initialPerPage);

    const searchTimeoutRef = useRef<NodeJS.Timeout>(null);
    const isFirstRenderRef = useRef(true);

    // Debounced search effect
    useEffect(() => {
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            router.get(
                route('admin.orders.index'),
                {
                    search: search || undefined,
                    status: status || undefined,
                    driver_id: driverId || undefined,
                    per_page: perPage,
                },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [search, status, driverId, perPage]);

    const handlePageChange = (page: number) => {
        router.get(
            route('admin.orders.index'),
            {
                page,
                search: search || undefined,
                status: status || undefined,
                driver_id: driverId || undefined,
                per_page: perPage,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
    };

    return {
        search,
        setSearch,
        status,
        setStatus,
        driverId,
        setDriverId,
        perPage,
        setPerPage,
        handlePageChange,
        handlePerPageChange,
    };
}
