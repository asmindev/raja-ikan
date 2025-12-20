import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';

/// Simple class untuk animate marker movement dengan smooth interpolation
class MarkerAnimator {
  final TickerProvider vsync;
  late AnimationController _controller;
  Animation<double>? _animation;

  LatLng _currentPosition;
  LatLng? _targetPosition;

  VoidCallback? _onUpdate;

  MarkerAnimator({required this.vsync, required LatLng initialPosition})
    : _currentPosition = initialPosition {
    _controller = AnimationController(
      duration: const Duration(milliseconds: 800), // Smooth 800ms transition
      vsync: vsync,
    );
  }

  /// Get current animated position
  LatLng get position => _currentPosition;

  /// Animate to new position
  void animateTo(LatLng target, {VoidCallback? onUpdate}) {
    // Skip if same position
    if (_currentPosition.latitude == target.latitude &&
        _currentPosition.longitude == target.longitude) {
      return;
    }

    _targetPosition = target;
    _onUpdate = onUpdate;

    // Setup animation dengan easeInOut curve
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeInOut);

    // Remove old listener
    _controller.removeListener(_updatePosition);

    // Add new listener
    _controller.addListener(_updatePosition);

    // Start animation
    _controller.forward(from: 0.0);
  }

  /// Update position menggunakan linear interpolation
  void _updatePosition() {
    if (_targetPosition == null) return;

    final t = _animation!.value;

    // Linear interpolation: current + (target - current) * t
    final lat =
        _currentPosition.latitude +
        (_targetPosition!.latitude - _currentPosition.latitude) * t;
    final lng =
        _currentPosition.longitude +
        (_targetPosition!.longitude - _currentPosition.longitude) * t;

    _currentPosition = LatLng(lat, lng);

    // Notify listener
    _onUpdate?.call();
  }

  /// Jump to position without animation (untuk initial position)
  void jumpTo(LatLng position) {
    _currentPosition = position;
    _targetPosition = null;
    _controller.reset();
  }

  /// Dispose controller
  void dispose() {
    _controller.dispose();
  }
}
