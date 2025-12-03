import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    CheckCircle2,
    Loader2,
    QrCode,
    RefreshCw,
    XCircle,
} from 'lucide-react';

interface QRCodeDisplayProps {
    qrCode: string | null;
    connectionStatus: 'connected' | 'disconnected' | 'connecting' | null;
    user?: {
        id: string;
        name: string;
    };
    isSocketConnected: boolean;
    onRequestQR: () => void;
    onRefreshStatus: () => void;
}

export function QRCodeDisplay({
    qrCode,
    connectionStatus,
    user,
    isSocketConnected,
    onRequestQR,
    onRefreshStatus,
}: QRCodeDisplayProps) {
    const getStatusBadge = () => {
        if (!connectionStatus) {
            return (
                <Badge variant="outline" className="gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Connecting...
                </Badge>
            );
        }

        switch (connectionStatus) {
            case 'connected':
                return (
                    <Badge variant="default" className="gap-1 bg-green-500">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                    </Badge>
                );
            case 'disconnected':
                return (
                    <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Disconnected
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Connecting...
                    </Badge>
                );
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>WhatsApp Connection</span>
                    {getStatusBadge()}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Socket.IO Status */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        Gateway:
                    </span>
                    <Badge
                        variant={isSocketConnected ? 'default' : 'destructive'}
                    >
                        {isSocketConnected ? 'Connected' : 'Disconnected'}
                    </Badge>
                </div>

                {/* Connected User Info */}
                {connectionStatus === 'connected' && user && (
                    <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="font-medium">
                                WhatsApp Connected
                            </span>
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                            <div>
                                <span className="font-medium">Account:</span>{' '}
                                {user.name}
                            </div>
                            <div className="text-xs">
                                <span className="font-medium">ID:</span>{' '}
                                {user.id}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRequestQR}
                        disabled={
                            !isSocketConnected ||
                            connectionStatus === 'connected'
                        }
                        className="flex-1 gap-2"
                    >
                        <QrCode className="h-4 w-4" />
                        {qrCode ? 'Refresh QR' : 'Generate QR'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefreshStatus}
                        disabled={!isSocketConnected}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* QR Code Display */}
                {qrCode && connectionStatus !== 'connected' && (
                    <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <QrCode className="h-4 w-4" />
                            <span className="font-medium">
                                Scan to Connect WhatsApp
                            </span>
                        </div>
                        <div className="flex justify-center rounded-lg bg-white p-4">
                            <img
                                src={qrCode}
                                alt="WhatsApp QR Code"
                                className="h-64 w-64 object-contain"
                            />
                        </div>
                        <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                            <p className="font-medium">How to scan:</p>
                            <ol className="ml-4 list-decimal space-y-1">
                                <li>Open WhatsApp on your phone</li>
                                <li>Tap Menu (⋮) or Settings</li>
                                <li>Select "Linked Devices"</li>
                                <li>Tap "Link a Device"</li>
                                <li>Point your phone at this QR code</li>
                            </ol>
                        </div>
                    </div>
                )}

                {/* Show message when disconnected and no QR */}
                {connectionStatus === 'disconnected' && !qrCode && (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900">
                        <QrCode className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                        <p className="mb-2 font-medium">No Active Session</p>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Generate a QR code to connect your WhatsApp account
                        </p>
                        <Button
                            onClick={onRequestQR}
                            disabled={!isSocketConnected}
                            className="cursor-pointer gap-2"
                        >
                            <QrCode className="h-4 w-4" />
                            Generate QR Code
                        </Button>
                    </div>
                )}

                {/* Loading state when connecting */}
                {connectionStatus === 'connecting' && !qrCode && (
                    <div className="rounded-lg border border-dashed p-6 text-center">
                        <Loader2 className="mx-auto mb-3 h-12 w-12 animate-spin text-muted-foreground" />
                        <p className="mb-2 font-medium">Connecting...</p>
                        <p className="text-sm text-muted-foreground">
                            Please wait while we establish connection
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
