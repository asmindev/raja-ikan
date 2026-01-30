import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    BarChart2,
    Car,
    Check,
    Loader2,
    Map as MapIcon,
    MapPin,
    MousePointerClick,
    Rocket,
    Trophy,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type {
    Coordinate,
    DriverRoute,
    OptimizeResponse,
    OSRMResponse,
} from '@/types/optimization';
import ComparisonMetrics from './components/comparison-metrics';
import RouteMap from './components/route-map';
import GAVisualization from './genetic';

type RouteSource = 'driver' | 'manual';
type Step = 'select' | 'display' | 'optimize';

export default function AlgorithmVisualization() {
    const [step, setStep] = useState<Step>('select');
    const [routeSource, setRouteSource] = useState<RouteSource>('manual');
    const [driverRoutes, setDriverRoutes] = useState<DriverRoute[]>([]);
    const [selectedDriverRoute, setSelectedDriverRoute] = useState<string>('');
    const [selectedPoints, setSelectedPoints] = useState<Coordinate[]>([]);
    const [initialRoute, setInitialRoute] = useState<OSRMResponse | null>(null);
    const [optimizationResult, setOptimizationResult] =
        useState<OptimizeResponse | null>(null);
    const [isLoadingDriverRoutes, setIsLoadingDriverRoutes] = useState(false);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [mapView, setMapView] = useState<{
        center: [number, number];
        zoom: number;
    }>();

    const handleViewChange = (
        center: { lat: number; lng: number },
        zoom: number,
    ) => {
        setMapView({ center: [center.lat, center.lng], zoom });
    };

    // Fetch driver routes
    const fetchDriverRoutes = async () => {
        setIsLoadingDriverRoutes(true);
        try {
            const response = await axios.get('/admin/algorithm/driver-routes');
            setDriverRoutes(response.data);
        } catch (error) {
            toast.error('Gagal memuat rute driver');
            console.error(error);
        } finally {
            setIsLoadingDriverRoutes(false);
        }
    };

    // Handle route source change
    const handleRouteSourceChange = (value: RouteSource) => {
        setRouteSource(value);
        setSelectedPoints([]);
        setInitialRoute(null);
        setOptimizationResult(null);
        setStep('select');

        if (value === 'driver' && driverRoutes.length === 0) {
            fetchDriverRoutes();
        }
    };

    // Handle driver route selection
    const handleDriverRouteSelect = (routeId: string) => {
        setSelectedDriverRoute(routeId);
        const route = driverRoutes.find((r) => r.id.toString() === routeId);
        if (route) {
            setSelectedPoints(route.coordinates);
        }
    };

    // Handle manual point addition
    const handlePointAdd = (point: Coordinate) => {
        setSelectedPoints([...selectedPoints, point]);
    };

    // Handle point removal
    const handlePointRemove = (index: number) => {
        setSelectedPoints(selectedPoints.filter((_, i) => i !== index));
    };

    // Fetch initial route from OSRM
    const handleShowInitialRoute = async () => {
        if (selectedPoints.length < 2) {
            toast.error('Minimal 2 titik diperlukan');
            return;
        }

        setIsLoadingRoute(true);
        try {
            // Build OSRM URL (Include return to start for Round Trip)
            const routePoints = [...selectedPoints, selectedPoints[0]];
            const coords = routePoints
                .map((p) => `${p.lng},${p.lat}`)
                .join(';');
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

            const response = await axios.get<OSRMResponse>(osrmUrl);
            setInitialRoute(response.data);
            setStep('display');
            toast.success('Rute awal berhasil ditampilkan');
        } catch (error) {
            toast.error('Gagal memuat rute dari OSRM');
            console.error(error);
        } finally {
            setIsLoadingRoute(false);
        }
    };

    // Optimize route
    const handleOptimize = async () => {
        if (!initialRoute) return;

        setIsOptimizing(true);
        try {
            // 1. Run Genetic Algorithm Optimization
            let response;
            try {
                response = await axios.post<OptimizeResponse>(
                    `${import.meta.env.VITE_OPTIMIZATION_SERVICE_URL}/api/v1/optimize`,
                    {
                        coordinates: selectedPoints.map((p) => ({
                            latitude: p.lat,
                            longitude: p.lng,
                        })),
                        use_cached_params: true,
                    },
                );
            } catch (gaError) {
                console.error('GA Service Error:', gaError);
                toast.error('Gagal menghubungkan ke layanan optimasi.');
                return;
            }

            if (!response.data || !response.data.optimized_order) {
                throw new Error('Format respon optimasi tidak valid');
            }

            // 2. Fetch OSRM route for the optimized sequence
            try {
                // optimized_order from backend includes the return-to-start index if it's a closed loop
                // We map these indices back to the original selectedPoints
                const optimizedPoints = response.data.optimized_order.map(
                    (idx) => selectedPoints[idx],
                );

                // Verify we have points
                if (optimizedPoints.some((p) => !p)) {
                    throw new Error('Indeks titik optimasi tidak valid');
                }

                const coords = optimizedPoints
                    .map((p) => `${p.lng},${p.lat}`)
                    .join(';');
                const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

                const osrmResponse = await axios.get<OSRMResponse>(osrmUrl);

                if (
                    !osrmResponse.data ||
                    !osrmResponse.data.routes ||
                    osrmResponse.data.routes.length === 0
                ) {
                    throw new Error(
                        'OSRM tidak dapat menemukan rute untuk hasil optimasi',
                    );
                }

                // 3. Update state with combined data
                const updatedResponse: OptimizeResponse = {
                    ...response.data,
                    total_distance: osrmResponse.data.routes[0].distance,
                    total_duration: osrmResponse.data.routes[0].duration,
                    osrm_route: osrmResponse.data,
                };

                setOptimizationResult(updatedResponse);
                setStep('optimize');
                toast.success('Optimasi berhasil!');
            } catch (osrmError) {
                console.error('OSRM Calculation Error:', osrmError);
                toast.error('Gagal menghitung geometri rute hasil optimasi.');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan yang tidak terduga');
            console.error(error);
        } finally {
            setIsOptimizing(false);
        }
    };

    // Reset
    const handleReset = () => {
        setStep('select');
        setSelectedPoints([]);
        setInitialRoute(null);
        setOptimizationResult(null);
        setSelectedDriverRoute('');
    };

    return (
        <Layout>
            <Head title="Optimasi Rute" />

            <div className="container mx-auto max-w-7xl space-y-8 p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Visualisasi Optimasi Rute
                    </h1>
                    <p className="max-w-2xl text-muted-foreground dark:text-gray-400">
                        Simulasi interaktif algoritma genetika untuk optimasi
                        rute pengiriman. Bandingkan efisiensi rute manual vs
                        hasil optimasi AI.
                    </p>
                </div>

                {/* Stepper */}
                <div className="relative">
                    <div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-gray-200 dark:bg-gray-700" />
                    <div className="relative flex justify-between">
                        {[
                            {
                                id: 'select',
                                label: '1. Konfigurasi',
                                icon: MapPin,
                            },
                            {
                                id: 'display',
                                label: '2. Analisis Awal',
                                icon: BarChart2,
                            },
                            {
                                id: 'optimize',
                                label: '3. Hasil Optimasi',
                                icon: Rocket,
                            },
                        ].map((s, idx) => {
                            const isActive = step === s.id;
                            const isCompleted =
                                (step === 'display' && idx === 0) ||
                                (step === 'optimize' && idx <= 1);
                            const Icon = s.icon;

                            return (
                                <div
                                    key={s.id}
                                    className={`flex flex-col items-center gap-2 bg-white px-4 py-2 dark:bg-gray-950 ${
                                        isActive || isCompleted
                                            ? 'text-primary dark:text-primary'
                                            : 'text-muted-foreground dark:text-gray-500'
                                    }`}
                                >
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg transition-all ${
                                            isActive
                                                ? 'scale-110 border-primary bg-primary text-white shadow-lg'
                                                : isCompleted
                                                  ? 'border-primary bg-white text-primary dark:bg-gray-900 dark:text-primary'
                                                  : 'border-gray-300 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500'
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <Icon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="min-h-[500px]">
                    {/* Step 1: Configuration */}
                    {step === 'select' && (
                        <div className="grid gap-6 lg:grid-cols-12">
                            {/* Left Panel: Controls */}
                            <div className="space-y-6 lg:col-span-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            Sumber Data
                                        </CardTitle>
                                        <CardDescription>
                                            Pilih metode input titik lokasi
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div
                                                onClick={() =>
                                                    handleRouteSourceChange(
                                                        'driver',
                                                    )
                                                }
                                                className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900 ${
                                                    routeSource === 'driver'
                                                        ? 'border-primary bg-slate-50 dark:bg-slate-900/50'
                                                        : 'border-transparent bg-white shadow-sm ring-1 ring-slate-200 dark:bg-gray-900 dark:ring-gray-800'
                                                }`}
                                            >
                                                <div className="mb-2 flex justify-center">
                                                    <Car className="h-8 w-8 text-blue-500" />
                                                </div>
                                                <div className="text-center font-semibold">
                                                    Driver Aktif
                                                </div>
                                                <div className="text-center text-xs text-muted-foreground">
                                                    Gunakan rute real-time
                                                </div>
                                            </div>

                                            <div
                                                onClick={() =>
                                                    handleRouteSourceChange(
                                                        'manual',
                                                    )
                                                }
                                                className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900 ${
                                                    routeSource === 'manual'
                                                        ? 'border-primary bg-slate-50 dark:bg-slate-900/50'
                                                        : 'border-transparent bg-white shadow-sm ring-1 ring-slate-200 dark:bg-gray-900 dark:ring-gray-800'
                                                }`}
                                            >
                                                <div className="mb-2 flex justify-center">
                                                    <MousePointerClick className="h-8 w-8 text-blue-500" />
                                                </div>
                                                <div className="text-center font-semibold">
                                                    Manual
                                                </div>
                                                <div className="text-center text-xs text-muted-foreground">
                                                    Pilih titik di peta
                                                </div>
                                            </div>
                                        </div>

                                        {routeSource === 'driver' && (
                                            <div className="space-y-3 rounded-md bg-slate-50 p-4 dark:bg-slate-900">
                                                <Label>Pilih Driver</Label>
                                                {isLoadingDriverRoutes ? (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Memuat data driver...
                                                    </div>
                                                ) : driverRoutes.length > 0 ? (
                                                    <Select
                                                        value={
                                                            selectedDriverRoute
                                                        }
                                                        onValueChange={
                                                            handleDriverRouteSelect
                                                        }
                                                    >
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder="Pilih driver..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {driverRoutes.map(
                                                                (route) => (
                                                                    <SelectItem
                                                                        key={
                                                                            route.id
                                                                        }
                                                                        value={route.id.toString()}
                                                                    >
                                                                        {
                                                                            route.driver_name
                                                                        }{' '}
                                                                        (
                                                                        {
                                                                            route
                                                                                .coordinates
                                                                                .length
                                                                        }{' '}
                                                                        titik)
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <p className="text-sm text-red-500">
                                                        Tidak ada driver aktif
                                                        saat ini
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {routeSource === 'manual' && (
                                            <div className="space-y-3 rounded-md bg-slate-50 p-4 dark:bg-slate-900">
                                                <div className="flex items-center justify-between">
                                                    <Label>
                                                        Daftar Titik (
                                                        {selectedPoints.length})
                                                    </Label>
                                                    {selectedPoints.length >
                                                        0 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                setSelectedPoints(
                                                                    [],
                                                                )
                                                            }
                                                            className="h-auto p-0 text-red-500 hover:bg-transparent hover:text-red-700"
                                                        >
                                                            Reset
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Klik peta untuk menambah
                                                    lokasi. Minimal 2 (Start + 1
                                                    Tujuan).
                                                </p>
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleShowInitialRoute}
                                            disabled={
                                                isLoadingRoute ||
                                                selectedPoints.length < 2
                                            }
                                            className="w-full text-base"
                                            size="lg"
                                        >
                                            {isLoadingRoute && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Analisis Rute Awal →
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Panel: Map */}
                            <div className="lg:col-span-8">
                                <Card className="h-full overflow-hidden border-2">
                                    <RouteMap
                                        points={selectedPoints}
                                        onPointAdd={handlePointAdd}
                                        onPointRemove={handlePointRemove}
                                        mode="select"
                                        autoZoom={false}
                                        initialView={mapView}
                                        onViewChange={handleViewChange}
                                        id="map-select"
                                    />
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Confirmation / Pre-Analysis */}
                    {step === 'display' && initialRoute && (
                        <div className="space-y-6">
                            <Card className="border-l-4 border-l-blue-500 shadow-sm dark:bg-gray-950">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2 text-xl text-blue-700 dark:text-blue-400">
                                                <MapIcon className="h-6 w-6" />
                                                Rute Awal Terdeteksi
                                            </CardTitle>
                                            <CardDescription>
                                                Berikut adalah rute default
                                                berdasarkan urutan input data.
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleReset}
                                                variant="outline"
                                            >
                                                Kembali
                                            </Button>
                                            <Button
                                                onClick={handleOptimize}
                                                disabled={isOptimizing}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {isOptimizing ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Rocket className="mr-2 h-4 w-4" />
                                                )}
                                                Jalankan Optimasi AI
                                                {!isOptimizing && (
                                                    <span className="ml-2 text-xs opacity-80">
                                                        (XGBoost + Genetic)
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-6 grid grid-cols-3 gap-6 rounded-lg bg-blue-50 p-6 dark:bg-blue-950/20">
                                        <div className="text-center">
                                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                Total Jarak
                                            </div>
                                            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                {(
                                                    initialRoute.routes[0]
                                                        .distance / 1000
                                                ).toFixed(2)}
                                                <span className="ml-1 text-sm font-normal text-muted-foreground">
                                                    km
                                                </span>
                                            </div>
                                        </div>
                                        <div className="border-x border-blue-200 text-center dark:border-blue-900">
                                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                Estimasi Waktu (OSRM)
                                            </div>
                                            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                {Math.floor(
                                                    initialRoute.routes[0]
                                                        .duration / 60,
                                                )}
                                                <span className="ml-1 text-sm font-normal text-muted-foreground">
                                                    menit
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                Total Titik
                                            </div>
                                            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                {selectedPoints.length}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-[500px] overflow-hidden rounded-xl border">
                                        <RouteMap
                                            points={selectedPoints}
                                            route={initialRoute}
                                            mode="display"
                                            initialView={mapView}
                                            onViewChange={handleViewChange}
                                            id="map-display"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Step 3: Optimization Results */}
                    {step === 'optimize' &&
                        optimizationResult &&
                        initialRoute && (
                            <div className="animate-in space-y-8 duration-700 fade-in slide-in-from-bottom-4">
                                {/* Summary & Actions */}
                                <Card className="border-l-4 border-l-green-500 shadow-lg">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2 text-2xl text-green-700">
                                                    <Trophy className="h-6 w-6" />
                                                    Optimasi Selesai
                                                </CardTitle>
                                            </div>
                                            <Button
                                                onClick={handleReset}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Mulai Ulang
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs
                                            defaultValue="summary"
                                            className="w-full"
                                        >
                                            <TabsList className="mb-4 grid w-full grid-cols-2 lg:w-[400px]">
                                                <TabsTrigger value="summary">
                                                    Ringkasan Performa
                                                </TabsTrigger>
                                                <TabsTrigger value="ga">
                                                    Detail AI (GA)
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent
                                                value="summary"
                                                className="mt-0"
                                            >
                                                <ComparisonMetrics
                                                    before={initialRoute}
                                                    after={optimizationResult}
                                                />
                                            </TabsContent>

                                            <TabsContent value="ga">
                                                <GAVisualization
                                                    data={
                                                        optimizationResult.details!
                                                    }
                                                    coordinates={selectedPoints}
                                                    targetDistance={
                                                        optimizationResult.total_distance
                                                    }
                                                />
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>

                                {/* Visual Comparison Maps */}
                                <div className="grid gap-6 lg:grid-cols-2">
                                    {/* Map 1: Before Optimization */}
                                    <Card className="overflow-hidden border-blue-200 p-0 shadow-md dark:border-blue-900">
                                        <CardHeader className="bg-blue-50/50 p-4 dark:bg-blue-950/20">
                                            <CardTitle className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-400">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold dark:bg-blue-900 dark:text-blue-200">
                                                    A
                                                </span>
                                                Rute Awal (Manual)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <RouteMap
                                                id="map-initial"
                                                points={selectedPoints}
                                                route={initialRoute}
                                                mode="display"
                                                initialView={mapView}
                                                onViewChange={handleViewChange}
                                            />
                                        </CardContent>
                                    </Card>

                                    {/* Map 2: After Optimization */}
                                    <Card className="overflow-hidden border-green-200 p-0 shadow-md dark:border-green-900">
                                        <CardHeader className="bg-green-50/50 p-4 dark:bg-green-950/20">
                                            <CardTitle className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold dark:bg-green-900 dark:text-green-200">
                                                    B
                                                </span>
                                                Rute Optimal (AI)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <RouteMap
                                                id="map-optimized"
                                                points={selectedPoints}
                                                optimizedRoute={
                                                    optimizationResult.osrm_route
                                                }
                                                optimizedOrder={
                                                    optimizationResult.optimized_order
                                                }
                                                mode="display"
                                                initialView={mapView}
                                                onViewChange={handleViewChange}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </Layout>
    );
}
