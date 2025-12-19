import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

function getPaginationRange(currentPage: number, lastPage: number) {
    const safeCurrent = Math.max(1, Math.min(currentPage, lastPage));

    if (lastPage <= 7) {
        return Array.from({ length: lastPage }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    pages.add(1);
    pages.add(lastPage);

    for (let p = safeCurrent - 1; p <= safeCurrent + 1; p++) {
        if (p > 1 && p < lastPage) pages.add(p);
    }

    // keep near-start/near-end compact without excessive ellipsis
    if (safeCurrent <= 3) {
        pages.add(2);
        pages.add(3);
        pages.add(4);
    }
    if (safeCurrent >= lastPage - 2) {
        pages.add(lastPage - 1);
        pages.add(lastPage - 2);
        pages.add(lastPage - 3);
    }

    return Array.from(pages)
        .filter((p) => p >= 1 && p <= lastPage)
        .sort((a, b) => a - b);
}

interface OrdersPaginationProps {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
}

export function OrdersPagination({
    currentPage,
    lastPage,
    total,
    onPageChange,
}: OrdersPaginationProps) {
    if (lastPage <= 1) {
        return null;
    }

    const pages = getPaginationRange(currentPage, lastPage);
    const canGoPrev = currentPage > 1;
    const canGoNext = currentPage < lastPage;

    const goTo = (page: number) => {
        const safe = Math.max(1, Math.min(page, lastPage));
        if (safe !== currentPage) onPageChange(safe);
    };

    return (
        <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
                Showing page {currentPage} of {lastPage} ({total} total orders)
            </p>

            <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            className={cn(
                                !canGoPrev && 'pointer-events-none opacity-50',
                            )}
                            aria-disabled={!canGoPrev}
                            onClick={(e) => {
                                e.preventDefault();
                                if (canGoPrev) goTo(currentPage - 1);
                            }}
                        />
                    </PaginationItem>

                    {pages.map((page, idx) => {
                        const prev = pages[idx - 1];
                        const showEllipsis =
                            idx > 0 && prev !== undefined && page - prev > 1;

                        return (
                            <>
                                {showEllipsis && (
                                    <PaginationItem key={`ellipsis-${page}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        href="#"
                                        isActive={page === currentPage}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            goTo(page);
                                        }}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            </>
                        );
                    })}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            className={cn(
                                !canGoNext && 'pointer-events-none opacity-50',
                            )}
                            aria-disabled={!canGoNext}
                            onClick={(e) => {
                                e.preventDefault();
                                if (canGoNext) goTo(currentPage + 1);
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
