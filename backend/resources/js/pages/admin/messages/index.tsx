import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeDisplay } from '@/components/whatsapp/qr-code-display';
import { useMessages } from '@/contexts/messages-context';
import Layout, { BreadcrumbItemType } from '@/layouts/admin-layout';
import { Loader2, MessageCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItemType[] = [
    { label: 'Admin', url: '/admin' },
    { label: 'Messages', url: '/admin/messages' },
];

export default function AdminMessagesIndex() {
    const {
        messages,
        isLoading,
        connectionStatus,
        qrCode,
        isConnected,
        requestQRCode,
        requestStatus,
    } = useMessages();

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <div className="w-full space-y-6 p-6">
                {/* QR Code & Connection Status */}
                <QRCodeDisplay
                    qrCode={qrCode}
                    connectionStatus={connectionStatus?.status || null}
                    user={connectionStatus?.user}
                    isSocketConnected={isConnected}
                    onRequestQR={requestQRCode}
                    onRefreshStatus={requestStatus}
                />

                {/* Incoming Messages */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Incoming Messages ({messages.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="max-h-[600px] space-y-2 overflow-y-auto">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                        <p className="text-sm text-muted-foreground">
                                            No messages yet
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Messages will appear here when
                                            someone sends you a WhatsApp message
                                        </p>
                                    </div>
                                ) : (
                                    messages
                                        .slice()
                                        .reverse()
                                        .map((msg) => (
                                            <div
                                                key={msg.id}
                                                className="space-y-1 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">
                                                        +{msg.from_number}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {msg.message_type}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm">
                                                    {msg.message_text ||
                                                        '(No text content)'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        msg.message_timestamp,
                                                    ).toLocaleString('id-ID', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                    })}
                                                </p>
                                            </div>
                                        ))
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
