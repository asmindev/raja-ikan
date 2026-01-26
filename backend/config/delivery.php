<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Driver Configuration
    |--------------------------------------------------------------------------
    |
    | These options configure driver-related settings for the delivery system.
    |
    */

    'driver' => [
        /*
        |--------------------------------------------------------------------------
        | Maximum Orders Per Driver
        |--------------------------------------------------------------------------
        |
        | This value determines the maximum number of active orders (pending,
        | confirmed, or delivering) that can be assigned to a single driver
        | at any given time. Set to 0 for unlimited.
        |
        */
        'max_active_orders' => (int) env('DRIVER_MAX_ACTIVE_ORDERS', 8),
    ],
];
