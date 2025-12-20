import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface NotesFormProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export function NotesForm({
    value,
    onChange,
    error,
    disabled,
}: NotesFormProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Catatan (Opsional)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="notes">Catatan Tambahan</Label>
                    <Textarea
                        id="notes"
                        placeholder="Tambahkan catatan untuk pesanan (opsional)"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        rows={2}
                        disabled={disabled}
                    />
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
