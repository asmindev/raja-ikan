import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Save } from 'lucide-react';

interface Props {
    isProcessing: boolean;
    orderId: number;
}

export const FormActions = ({ isProcessing, orderId }: Props) => {
    return (
        <div className="flex justify-end gap-3">
            <Button variant="outline" asChild disabled={isProcessing}>
                <Link href={`/admin/orders/${orderId}`}>Batal</Link>
            </Button>
            <Button type="submit" disabled={isProcessing}>
                <Save className="mr-2 h-4 w-4" />
                {isProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
        </div>
    );
};
