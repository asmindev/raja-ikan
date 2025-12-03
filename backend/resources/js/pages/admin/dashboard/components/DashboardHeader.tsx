import { LayoutDashboard } from 'lucide-react';

export default function DashboardHeader() {
    return (
        <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
                <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Overview statistik aplikasi Anda
                </p>
            </div>
        </div>
    );
}
