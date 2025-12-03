import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/map_tile.dart';

/// State untuk menyimpan tile yang dipilih
class MapTileState {
  final MapTileLayer selectedTile;

  MapTileState({required this.selectedTile});

  MapTileState copyWith({MapTileLayer? selectedTile}) {
    return MapTileState(selectedTile: selectedTile ?? this.selectedTile);
  }
}

/// Notifier untuk manage tile selection
class MapTileNotifier extends StateNotifier<MapTileState> {
  MapTileNotifier()
    : super(MapTileState(selectedTile: MapTileLayers.defaultTile));

  /// Change selected tile
  void selectTile(String tileId) {
    final tile = MapTileLayers.getTileById(tileId);
    if (tile != null) {
      state = state.copyWith(selectedTile: tile);
    }
  }

  /// Change to specific tile object
  void setTile(MapTileLayer tile) {
    state = state.copyWith(selectedTile: tile);
  }
}

/// Provider untuk map tile state
final mapTileProvider = StateNotifierProvider<MapTileNotifier, MapTileState>(
  (ref) => MapTileNotifier(),
);

/// Provider untuk get current selected tile
final selectedTileProvider = Provider<MapTileLayer>((ref) {
  return ref.watch(mapTileProvider).selectedTile;
});
