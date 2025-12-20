class DriverStats {
  final int totalDeliveries;
  final int completedDeliveries;
  final int ongoingDeliveries;
  final int cancelledDeliveries;
  final double? totalEarnings;
  final double? averageRating;

  DriverStats({
    required this.totalDeliveries,
    required this.completedDeliveries,
    required this.ongoingDeliveries,
    required this.cancelledDeliveries,
    this.totalEarnings,
    this.averageRating,
  });

  factory DriverStats.fromJson(Map<String, dynamic> json) {
    return DriverStats(
      totalDeliveries: json['total_deliveries'] as int? ?? 0,
      completedDeliveries: json['completed_deliveries'] as int? ?? 0,
      ongoingDeliveries: json['ongoing_deliveries'] as int? ?? 0,
      cancelledDeliveries: json['cancelled_deliveries'] as int? ?? 0,
      totalEarnings: json['total_earnings'] != null
          ? double.tryParse(json['total_earnings'].toString())
          : null,
      averageRating: json['average_rating'] != null
          ? double.tryParse(json['average_rating'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total_deliveries': totalDeliveries,
      'completed_deliveries': completedDeliveries,
      'ongoing_deliveries': ongoingDeliveries,
      'cancelled_deliveries': cancelledDeliveries,
      'total_earnings': totalEarnings,
      'average_rating': averageRating,
    };
  }

  static DriverStats empty() {
    return DriverStats(
      totalDeliveries: 0,
      completedDeliveries: 0,
      ongoingDeliveries: 0,
      cancelledDeliveries: 0,
      totalEarnings: 0.0,
      averageRating: 0.0,
    );
  }
}
