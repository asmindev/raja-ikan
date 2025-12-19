import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Save } from 'lucide-react';

interface FormActionsProps {
    processing: boolean;
}

export function FormActions({ processing }: FormActionsProps) {
    return (
        <div className="flex gap-3">
            <Link href={route('admin.orders.index')} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                    Cancel
                </Button>
            </Link>
            <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={processing}
            >
                <Save className="h-4 w-4" />
                {processing ? 'Creating...' : 'Create Order'}
            </Button>
        </div>
    );
}
