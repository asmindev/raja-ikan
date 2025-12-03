import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { User } from '@/types/user';
import { Table as TanStackTable } from '@tanstack/react-table';

interface UserPaginationProps {
    table: TanStackTable<User>;
}

export function UserPagination({ table }: UserPaginationProps) {
    const pageCount = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex + 1;

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => table.previousPage()}
                        className={
                            !table.getCanPreviousPage()
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                        }
                    />
                </PaginationItem>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                    (page) => (
                        <PaginationItem key={page}>
                            <PaginationLink
                                onClick={() => table.setPageIndex(page - 1)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    ),
                )}
                <PaginationItem>
                    <PaginationNext
                        onClick={() => table.nextPage()}
                        className={
                            !table.getCanNextPage()
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                        }
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
