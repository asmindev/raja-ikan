import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCircle,
    ChevronsUpDown,
    Edit,
    Trash2,
    UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { Order } from '../types';
import { getStatusConfig } from '../utils/status-utils';

interface Driver {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface OrderHeaderProps {
    order: Order;
    availableDrivers: Driver[];
}

export function OrderHeader({ order, availableDrivers }: OrderHeaderProps) {
    const statusConfig = getStatusConfig(order.status);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState<string>('');
    const [comboboxOpen, setComboboxOpen] = useState(false);

    const selectedDriver = availableDrivers.find(
        (d) => d.id.toString() === selectedDriverId,
    );

    const handleAssignDriver = () => {
        if (!selectedDriverId) {
            alert('Pilih driver terlebih dahulu');
            return;
        }

        router.post(
            route('admin.orders.assign-driver', order.id),
            { driver_id: selectedDriverId },
            {
                onSuccess: () => {
                    setShowAssignDialog(false);
                    setSelectedDriverId('');
                    setComboboxOpen(false);
                },
            },
        );
    };

    const handleConfirm = () => {
        router.post(
            route('admin.orders.confirm', order.id),
            {},
            {
                onSuccess: () => {
                    setShowConfirmDialog(false);
                },
            },
        );
    };

    const handleDelete = () => {
        router.delete(route('admin.orders.destroy', order.id), {
            onSuccess: () => {
                router.visit(route('admin.orders.index'));
            },
        });
    };

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                            router.visit(route('admin.orders.index'))
                        }
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            Order #{order.id}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString(
                                'id-ID',
                                {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                },
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge
                        variant={statusConfig.variant}
                        className="h-fit gap-2 px-3 py-1 text-base"
                    >
                        <statusConfig.icon className="h-3 w-3" />
                        {statusConfig.label}
                    </Badge>
                    <ButtonGroup>
                        {!order.confirmed_at && order.status === 'pending' && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setShowConfirmDialog(true)}
                                className="gap-2"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Konfirmasi
                            </Button>
                        )}
                        {order.confirmed_at && !order.driver_id && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAssignDialog(true)}
                                className="gap-2"
                            >
                                <UserPlus className="h-4 w-4" />
                                Assign Driver
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() =>
                                router.visit(
                                    route('admin.orders.edit', order.id),
                                )
                            }
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                            className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </ButtonGroup>
                </div>
            </div>

            {/* Confirm Dialog */}
            <AlertDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Pesanan</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin mengkonfirmasi pesanan #
                            {order.id}? Pesanan yang sudah dikonfirmasi dapat
                            diproses lebih lanjut oleh driver.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>
                            Ya, Konfirmasi
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Dialog */}
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Pesanan</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus pesanan #
                            {order.id}? Tindakan ini tidak dapat dibatalkan dan
                            semua data pesanan akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Assign Driver Dialog */}
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Driver</DialogTitle>
                        <DialogDescription>
                            Pilih driver yang akan menangani pesanan #{order.id}
                            . Driver akan menerima notifikasi setelah
                            ditugaskan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="driver">Driver</Label>
                        <Popover
                            open={comboboxOpen}
                            onOpenChange={setComboboxOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    id="driver"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={comboboxOpen}
                                    className="mt-2 w-full justify-between"
                                >
                                    {selectedDriver ? (
                                        <div className="flex flex-col items-start">
                                            <span className="font-medium">
                                                {selectedDriver.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {selectedDriver.phone} •{' '}
                                                {selectedDriver.email}
                                            </span>
                                        </div>
                                    ) : (
                                        'Pilih driver...'
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-full p-0"
                                align="start"
                            >
                                <Command>
                                    <CommandInput placeholder="Cari driver..." />
                                    <CommandList>
                                        <CommandEmpty>
                                            Tidak ada driver ditemukan.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {availableDrivers.map((driver) => (
                                                <CommandItem
                                                    key={driver.id}
                                                    value={`${driver.name} ${driver.phone} ${driver.email}`}
                                                    onSelect={() => {
                                                        setSelectedDriverId(
                                                            driver.id.toString(),
                                                        );
                                                        setComboboxOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            'mr-2 h-4 w-4',
                                                            selectedDriverId ===
                                                                driver.id.toString()
                                                                ? 'opacity-100'
                                                                : 'opacity-0',
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {driver.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {driver.phone} •{' '}
                                                            {driver.email}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowAssignDialog(false)}
                        >
                            Batal
                        </Button>
                        <Button onClick={handleAssignDriver}>
                            Assign Driver
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
