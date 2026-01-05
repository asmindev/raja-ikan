class OrderItem {
  final int id;
  final String productName;
  final int quantity;
  final double price;
  final double subtotal;

  OrderItem({
    required this.id,
    required this.productName,
    required this.quantity,
    required this.price,
    required this.subtotal,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    print('🔍 OrderItem.fromJson - RAW JSON: $json');
    print('🔍 OrderItem - id type: ${json['id'].runtimeType}, value: ${json['id']}');
    print('🔍 OrderItem - quantity type: ${json['quantity'].runtimeType}, value: ${json['quantity']}');

    try {
      final orderItem = OrderItem(
        id: int.tryParse(json['id'].toString()) ?? 0,
        productName: json['product_name'] as String? ?? 'Unknown Product',
        quantity: int.tryParse(json['quantity'].toString()) ?? 0,
        price: double.tryParse(json['price'].toString()) ?? 0,
        subtotal: double.tryParse(json['subtotal'].toString()) ?? 0,
      );
      print('✅ OrderItem created successfully: id=${orderItem.id}, quantity=${orderItem.quantity}');
      return orderItem;
    } catch (e, stackTrace) {
      print('❌ ERROR in OrderItem.fromJson: $e');
      print('📍 Stack trace: $stackTrace');
      rethrow;
    }
  }
}

class OrderModel {
  final int id;
  final String status;
  final double total;
  final String address;
  final DateTime? estimated;
  final DateTime? createdAt;
  final DateTime? acceptedAt;
  final DateTime? pickupAt;
  final DateTime? deliveringAt;
  final DateTime? deliveryAt;
  final DateTime? cancelledAt;
  final String? customerName;
  final String? customerPhone;
  final double? customerLatitude;
  final double? customerLongitude;
  final String? driverName;
  final List<OrderItem> items;
  final bool isAssigned; // true if driver_id is not null
  final bool isMine; // true if assigned to current logged-in driver

  OrderModel({
    required this.id,
    required this.status,
    required this.total,
    required this.address,
    this.estimated,
    this.createdAt,
    this.acceptedAt,
    this.pickupAt,
    this.deliveringAt,
    this.deliveryAt,
    this.cancelledAt,
    this.customerName,
    this.customerPhone,
    this.customerLatitude,
    this.customerLongitude,
    this.driverName,
    this.items = const [],
    this.isAssigned = false,
    this.isMine = false,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    print('🔍 OrderModel.fromJson - RAW JSON: $json');
    print('🔍 OrderModel - id type: ${json['id'].runtimeType}, value: ${json['id']}');

    try {
      String? customerName;
      String? customerPhone;
      double? customerLatitude;
      double? customerLongitude;
      String? driverName;

      // Handle customer data
      final customer = json['customer'];
      if (customer is Map) {
        if (customer['name'] is String) {
          customerName = customer['name'] as String;
        }
        if (customer['latitude'] != null) {
          customerLatitude = double.tryParse(customer['latitude'].toString());
        }
        if (customer['longitude'] != null) {
          customerLongitude = double.tryParse(customer['longitude'].toString());
        }
      }

      // Handle driver data
      final driver = json['driver'];
      if (driver is Map && driver['name'] is String) {
        driverName = driver['name'] as String;
      }

      // Handle customer_name from API detail response
      if (json['customer_name'] != null) {
        customerName = json['customer_name'] as String;
      }

      // Handle customer_phone from API detail response
      if (json['customer_phone'] != null) {
        customerPhone = json['customer_phone'] as String;
      }

      // Handle driver_name from API detail response
      if (json['driver_name'] != null) {
        driverName = json['driver_name'] as String;
      }

      // Parse items if available
      List<OrderItem> items = [];
      if (json['items'] != null && json['items'] is List) {
        print('🔍 Parsing ${(json['items'] as List).length} items...');
        items = (json['items'] as List)
            .map((item) => OrderItem.fromJson(item as Map<String, dynamic>))
            .toList();
      }

      final orderModel = OrderModel(
        id: int.tryParse(json['id'].toString()) ?? 0,
        status: json['status'] as String,
        total: double.tryParse(json['total'].toString()) ?? 0,
        address: json['address'] as String? ?? '-',
        estimated: json['estimated'] != null && json['estimated'] != ''
            ? DateTime.tryParse(json['estimated'].toString())
            : null,
        createdAt: json['created_at'] != null && json['created_at'] != ''
            ? DateTime.tryParse(json['created_at'].toString())
            : null,
        acceptedAt: json['accepted_at'] != null && json['accepted_at'] != ''
            ? DateTime.tryParse(json['accepted_at'].toString())
            : null,
        pickupAt: json['pickup_at'] != null && json['pickup_at'] != ''
            ? DateTime.tryParse(json['pickup_at'].toString())
            : null,
        deliveringAt: json['delivering_at'] != null && json['delivering_at'] != ''
            ? DateTime.tryParse(json['delivering_at'].toString())
            : null,
        deliveryAt: json['delivery_at'] != null && json['delivery_at'] != ''
            ? DateTime.tryParse(json['delivery_at'].toString())
            : null,
        cancelledAt: json['cancelled_at'] != null && json['cancelled_at'] != ''
            ? DateTime.tryParse(json['cancelled_at'].toString())
            : null,
        customerName: customerName,
        customerPhone: customerPhone,
        customerLatitude: customerLatitude,
        customerLongitude: customerLongitude,
        driverName: driverName,
        items: items,
        isAssigned: json['is_assigned'] as bool? ?? false,
        isMine: json['is_mine'] as bool? ?? false,
      );

      print('✅ OrderModel created successfully: id=${orderModel.id}, status=${orderModel.status}');
      return orderModel;
    } catch (e, stackTrace) {
      print('❌ ERROR in OrderModel.fromJson: $e');
      print('📍 Stack trace: $stackTrace');
      print('📋 Full JSON that caused error: $json');
      rethrow;
    }
  }
}
