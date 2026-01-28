import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { Loader2 } from 'lucide-react';
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
            const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

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
                const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

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

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Visualisasi Optimasi Rute
                    </h1>
                    <p className="text-muted-foreground">
                        Simulasi dan visualisasi proses optimasi rute
                        menggunakan Genetic Algorithm
                    </p>
                </div>

                {/* Step 1: Source Selection */}
                {step === 'select' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>📍 Pilih Sumber Rute</CardTitle>
                            <CardDescription>
                                Pilih rute dari driver aktif atau tambahkan
                                titik secara manual
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <RadioGroup
                                value={routeSource}
                                onValueChange={handleRouteSourceChange}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="driver"
                                        id="driver"
                                    />
                                    <Label htmlFor="driver">
                                        Rute Driver Aktif
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="manual"
                                        id="manual"
                                    />
                                    <Label htmlFor="manual">
                                        Pilih Titik Manual
                                    </Label>
                                </div>
                            </RadioGroup>

                            {routeSource === 'driver' && (
                                <div className="space-y-4">
                                    {isLoadingDriverRoutes ? (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Memuat rute driver...
                                        </div>
                                    ) : driverRoutes.length > 0 ? (
                                        <Select
                                            value={selectedDriverRoute}
                                            onValueChange={
                                                handleDriverRouteSelect
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih driver" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {driverRoutes.map((route) => (
                                                    <SelectItem
                                                        key={route.id}
                                                        value={route.id.toString()}
                                                    >
                                                        {route.driver_name} (
                                                        {
                                                            route.coordinates
                                                                .length
                                                        }{' '}
                                                        titik)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Tidak ada rute driver aktif
                                        </p>
                                    )}
                                </div>
                            )}

                            {routeSource === 'manual' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Klik pada peta untuk menambahkan
                                            titik (minimal 2 titik)
                                        </p>
                                        {selectedPoints.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedPoints([])
                                                }
                                                className="h-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                            >
                                                Hapus Semua
                                            </Button>
                                        )}
                                    </div>
                                    <RouteMap
                                        points={selectedPoints}
                                        onPointAdd={handlePointAdd}
                                        onPointRemove={handlePointRemove}
                                        mode="select"
                                        autoZoom={false}
                                        initialView={mapView}
                                        onViewChange={handleViewChange}
                                    />
                                </div>
                            )}

                            {selectedPoints.length >= 2 && (
                                <Button
                                    onClick={handleShowInitialRoute}
                                    disabled={isLoadingRoute}
                                    className="w-full"
                                >
                                    {isLoadingRoute && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Tampilkan Rute Awal
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Display Initial Route */}
                {step === 'display' && initialRoute && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>🗺️ Rute Awal</CardTitle>
                                <CardDescription>
                                    Rute sebelum optimasi dari OSRM
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RouteMap
                                    points={selectedPoints}
                                    route={initialRoute}
                                    mode="display"
                                    initialView={mapView}
                                    onViewChange={handleViewChange}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>📊 Informasi Rute Awal</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Total Jarak
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {(
                                                initialRoute.routes[0]
                                                    .distance / 1000
                                            ).toFixed(2)}{' '}
                                            km
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Estimasi Waktu
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {Math.floor(
                                                initialRoute.routes[0]
                                                    .duration / 60,
                                            )}{' '}
                                            menit
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Jumlah Titik
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {selectedPoints.length} titik
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleOptimize}
                                        disabled={isOptimizing}
                                        className="flex-1"
                                    >
                                        {isOptimizing && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        🚀 Optimasi Rute
                                    </Button>
                                    <Button
                                        onClick={handleReset}
                                        variant="outline"
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Step 3: Optimization Results */}
                {step === 'optimize' && optimizationResult && initialRoute && (
                    <>
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>🗺️ Hasil Optimasi Rute</CardTitle>
                                <CardDescription>
                                    Rute setelah dioptimasi dengan Genetic
                                    Algorithm (Hijau = Optimized, Biru =
                                    Original)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RouteMap
                                    points={selectedPoints}
                                    route={initialRoute}
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

                        <div className="flex justify-end">
                            <Button onClick={handleReset} variant="outline">
                                Mulai Ulang
                            </Button>
                        </div>

                        <Tabs defaultValue="summary" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="summary">
                                    Ringkasan
                                </TabsTrigger>
                                <TabsTrigger value="ga">
                                    Genetic Algorithm
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="summary" className="space-y-4">
                                <ComparisonMetrics
                                    before={initialRoute}
                                    after={optimizationResult}
                                />
                            </TabsContent>

                            <TabsContent value="ga" className="space-y-4">
                                <GAVisualization
                                    data={optimizationResult.details!}
                                    coordinates={selectedPoints}
                                />
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </div>
        </Layout>
    );
}
