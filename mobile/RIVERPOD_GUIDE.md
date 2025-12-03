# State Management dengan Riverpod

State management untuk aplikasi delivery menggunakan **flutter_riverpod**.

## 📁 Struktur Providers

```
lib/providers/
├── providers.dart           # Export semua providers
├── delivery_provider.dart   # State pengiriman aktif
├── route_provider.dart      # State optimasi rute
└── auth_provider.dart       # State autentikasi driver
```

## 🚀 Setup

### 1. Install Package

```yaml
dependencies:
    flutter_riverpod: ^2.6.1
```

### 2. Wrap App dengan ProviderScope

```dart
void main() {
  runApp(
    const ProviderScope(
      child: MainApp(),
    ),
  );
}
```

## 📦 Providers

### 1. DeliveryProvider

Manage state pengiriman aktif driver.

**State:**

-   `activeDeliveries` - List pesanan yang sedang diantar
-   `completedToday` - Jumlah pengiriman selesai hari ini
-   `isLoading` - Loading state
-   `error` - Error message

**Methods:**

```dart
// Load deliveries
ref.read(deliveryProvider.notifier).loadDeliveries();

// Mark as completed
ref.read(deliveryProvider.notifier).markAsCompleted(orderId);

// Optimize route
ref.read(deliveryProvider.notifier).optimizeRoute();
```

**Usage:**

```dart
class HomeScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deliveryState = ref.watch(deliveryProvider);
    final orders = deliveryState.activeDeliveries;

    return ListView.builder(
      itemCount: orders.length,
      itemBuilder: (context, index) {
        return OrderCard(order: orders[index]);
      },
    );
  }
}
```

**Computed Providers:**

```dart
// Jumlah pengiriman aktif
final count = ref.watch(activeDeliveriesCountProvider);

// Total nilai pengiriman
final total = ref.watch(totalDeliveryValueProvider);

// Ada pengiriman aktif?
final hasActive = ref.watch(hasActiveDeliveriesProvider);
```

### 2. RouteProvider

Manage state optimasi rute pengiriman.

**State:**

-   `optimizedRoute` - Urutan pengiriman yang optimal
-   `totalDistance` - Total jarak (km)
-   `estimatedTime` - Estimasi waktu (menit)
-   `isOptimizing` - Loading state optimasi

**Methods:**

```dart
// Optimize route
ref.read(routeProvider.notifier).optimizeRoute(orders);

// Clear route
ref.read(routeProvider.notifier).clearRoute();
```

**Usage:**

```dart
final routeState = ref.watch(routeProvider);

if (routeState.isOptimizing) {
  return CircularProgressIndicator();
}

Text('Jarak: ${routeState.totalDistance} km');
Text('Waktu: ${ref.watch(estimatedDeliveryTimeProvider)}');
```

### 3. AuthProvider

Manage state autentikasi driver.

**State:**

-   `driver` - Data driver yang login
-   `isAuthenticated` - Status login
-   `isLoading` - Loading state
-   `error` - Error message

**Methods:**

```dart
// Login
ref.read(authProvider.notifier).login(email, password);

// Logout
ref.read(authProvider.notifier).logout();

// Check auth
ref.read(authProvider.notifier).checkAuth();
```

**Usage:**

```dart
// Di login screen
ElevatedButton(
  onPressed: () {
    ref.read(authProvider.notifier).login(email, password);
  },
  child: Text('Login'),
);

// Check if authenticated
final isAuth = ref.watch(isAuthenticatedProvider);
if (!isAuth) {
  return LoginScreen();
}

// Get current driver
final driver = ref.watch(currentDriverProvider);
Text('Halo, ${driver?.name}');
```

## 🎨 Widget Types

### ConsumerWidget

Untuk stateless widget yang perlu akses provider:

```dart
class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final data = ref.watch(someProvider);
    return Text(data);
  }
}
```

### ConsumerStatefulWidget

Untuk stateful widget yang perlu akses provider:

```dart
class MyWidget extends ConsumerStatefulWidget {
  @override
  ConsumerState<MyWidget> createState() => _MyWidgetState();
}

class _MyWidgetState extends ConsumerState<MyWidget> {
  @override
  Widget build(BuildContext context) {
    final data = ref.watch(someProvider);
    return Text(data);
  }
}
```

### Consumer

Untuk bagian kecil dalam widget tree:

```dart
Widget build(BuildContext context) {
  return Column(
    children: [
      Text('Static'),
      Consumer(
        builder: (context, ref, child) {
          final data = ref.watch(someProvider);
          return Text(data);
        },
      ),
    ],
  );
}
```

## 📖 Best Practices

### 1. Watch vs Read

```dart
// ✅ WATCH - untuk rebuild otomatis saat state berubah
final data = ref.watch(deliveryProvider);

// ✅ READ - untuk aksi (tidak rebuild)
onPressed: () {
  ref.read(deliveryProvider.notifier).loadDeliveries();
}

// ❌ JANGAN watch di event handler
onPressed: () {
  ref.watch(deliveryProvider); // WRONG!
}
```

### 2. Loading State

```dart
final state = ref.watch(deliveryProvider);

if (state.isLoading) {
  return CircularProgressIndicator();
}

if (state.error != null) {
  return Text('Error: ${state.error}');
}

return ListView(...);
```

### 3. Computed Values

Buat provider baru untuk nilai yang dihitung:

```dart
final totalProvider = Provider<double>((ref) {
  final orders = ref.watch(deliveryProvider).activeDeliveries;
  return orders.fold(0.0, (sum, order) => sum + order.total);
});
```

### 4. Side Effects

Gunakan `addPostFrameCallback` untuk side effects:

```dart
if (error != null) {
  WidgetsBinding.instance.addPostFrameCallback((_) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(error)),
    );
  });
}
```

## 🔄 Migration dari setState

**Before (setState):**

```dart
class MyWidget extends StatefulWidget {
  @override
  State<MyWidget> createState() => _MyWidgetState();
}

class _MyWidgetState extends State<MyWidget> {
  List<Order> orders = [];
  bool isLoading = false;

  void loadData() async {
    setState(() => isLoading = true);
    final data = await api.fetch();
    setState(() {
      orders = data;
      isLoading = false;
    });
  }
}
```

**After (Riverpod):**

```dart
class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(deliveryProvider);

    return state.isLoading
      ? CircularProgressIndicator()
      : ListView(children: state.activeDeliveries);
  }
}

// Load data
ref.read(deliveryProvider.notifier).loadDeliveries();
```

## 📚 Resources

-   [Riverpod Documentation](https://riverpod.dev/)
-   [Flutter State Management](https://docs.flutter.dev/development/data-and-backend/state-mgmt/options)
-   [Riverpod Examples](https://github.com/rrousselGit/riverpod/tree/master/examples)
