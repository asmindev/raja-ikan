<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private string $baseUrl;
    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = env('WA_GATEWAY_URL', 'http://localhost:3000');
        $this->timeout = 10;
    }

    /**
     * Send WhatsApp message
     */
    private function sendMessage(string $phone, string $message): bool
    {
        try {
            // Format phone number (remove leading 0, add 62)
            $formattedPhone = $this->formatPhoneNumber($phone);

            $response = Http::timeout($this->timeout)
                ->post("{$this->baseUrl}/api/send", [
                    'to' => $formattedPhone,
                    'message' => $message,
                ]);

            if ($response->successful()) {
                Log::info('WhatsApp message sent', [
                    'to' => $formattedPhone,
                    'message' => substr($message, 0, 50) . '...',
                ]);
                return true;
            }

            Log::error('WhatsApp message failed', [
                'to' => $formattedPhone,
                'status' => $response->status(),
                'response' => $response->body(),
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('WhatsApp service error', [
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Format phone number to international format
     */
    private function formatPhoneNumber(string $phone): string
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Remove leading 0
        if (str_starts_with($phone, '0')) {
            $phone = substr($phone, 1);
        }

        // Add country code if not present
        if (!str_starts_with($phone, '62')) {
            $phone = '62' . $phone;
        }

        return $phone;
    }

    /**
     * Send notification when order is confirmed by admin
     */
    public function sendOrderConfirmed(Order $order): bool
    {
        Log::info('Sending order confirmed WA', ['order_id' => $order->id]);
        $order->load('customer', 'orderLines.product');
        Log::info('Order loaded for customer', ['customer_id' => $order->customer?->id]);

        $customer = $order->customer;
        if (!$customer || !$customer->phone) {
            Log::warning('Cannot send WA: Customer has no phone', ['order_id' => $order->id]);
            return false;
        }

        $productList = $order->orderLines
            ->map(fn($line) => "- {$line->product->name} ({$line->quantity}x)")
            ->join("\n");

        $message = "✅ *Pesanan Dikonfirmasi*\n\n"
            . "Halo {$customer->name},\n\n"
            . "Pesanan Anda #{$order->id} telah dikonfirmasi!\n\n"
            . "*Detail Pesanan:*\n{$productList}\n\n"
            . "*Total:* Rp " . number_format($order->total, 0, ',', '.') . "\n"
            . "*Alamat:* {$order->address}\n\n"
            . "Driver akan segera ditugaskan untuk mengantarkan pesanan Anda.\n\n"
            . "Terima kasih! 🙏";


        return $this->sendMessage($customer->phone, $message);
    }

    /**
     * Send notification when order status changes to delivering
     */
    public function sendOrderDelivering(Order $order): bool
    {
        $order->load('customer', 'driver');

        $customer = $order->customer;
        if (!$customer || !$customer->phone) {
            Log::warning('Cannot send WA: Customer has no phone', ['order_id' => $order->id]);
            return false;
        }

        $driverName = $order->driver ? $order->driver->name : 'Driver';
        $driverPhone = $order->driver && $order->driver->phone
            ? "\n*Kontak Driver:* {$order->driver->phone}"
            : '';

        $message = "🚚 *Pesanan Sedang Dikirim*\n\n"
            . "Halo {$customer->name},\n\n"
            . "Pesanan Anda #{$order->id} sedang dalam perjalanan!\n\n"
            . "*Driver:* {$driverName}{$driverPhone}\n"
            . "*Alamat Tujuan:* {$order->address}\n\n"
            . "Mohon bersiap untuk menerima pesanan Anda. 📦\n\n"
            . "Terima kasih! 🙏";

        return $this->sendMessage($customer->phone, $message);
    }

    /**
     * Send notification when order is completed
     */
    public function sendOrderCompleted(Order $order): bool
    {
        $order->load('customer', 'orderLines.product');

        $customer = $order->customer;
        if (!$customer || !$customer->phone) {
            Log::warning('Cannot send WA: Customer has no phone', ['order_id' => $order->id]);
            return false;
        }

        $productCount = $order->orderLines->sum('quantity');

        $message = "✅ *Pesanan Telah Sampai*\n\n"
            . "Halo {$customer->name},\n\n"
            . "Pesanan Anda #{$order->id} telah berhasil diantarkan! 🎉\n\n"
            . "*Total Item:* {$productCount} item\n"
            . "*Total Pembayaran:* Rp " . number_format($order->total, 0, ',', '.') . "\n\n"
            . "Terima kasih telah berbelanja dengan kami.\n"
            . "Kami tunggu pesanan Anda berikutnya! 🙏\n\n"
            . "_Jika ada kendala, silakan hubungi kami._";

        return $this->sendMessage($customer->phone, $message);
    }

    /**
     * Send OTP code via WhatsApp
     */
    public function sendOtp(string $phone, string $code): bool
    {
        $message = "🔐 *Kode OTP Raja Ikan*\n\n"
            . "Kode verifikasi Anda adalah:\n\n"
            . "*{$code}*\n\n"
            . "Berlaku selama 2 menit.\n"
            . "⚠️ Jangan bagikan kode ini kepada siapapun!\n\n"
            . "_Jika Anda tidak merasa meminta kode ini, abaikan pesan ini._";

        return $this->sendMessage($phone, $message);
    }

    /**
     * Check if WA Gateway is online
     */
    public function checkStatus(): array
    {
        try {
            $response = Http::timeout(5)->get("{$this->baseUrl}/status");

            if ($response->successful()) {
                return [
                    'online' => true,
                    'data' => $response->json(),
                ];
            }

            return ['online' => false, 'error' => 'Service unavailable'];
        } catch (\Exception $e) {
            return ['online' => false, 'error' => $e->getMessage()];
        }
    }
}
