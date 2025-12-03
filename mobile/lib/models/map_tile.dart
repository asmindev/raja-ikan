/// Model untuk konfigurasi tile layer map
class MapTileLayer {
  final String id;
  final String name;
  final String urlTemplate;
  final int maxZoom;
  final int minZoom;
  final String attribution;
  final String? description;

  const MapTileLayer({
    required this.id,
    required this.name,
    required this.urlTemplate,
    this.maxZoom = 18,
    this.minZoom = 5,
    required this.attribution,
    this.description,
  });
}

/// Daftar tile layers yang tersedia
class MapTileLayers {
  static const List<MapTileLayer> availableTiles = [
    // Google Maps Tiles
    // Source: https://stackoverflow.com/a/9395777
    // Posted by Nicky, Retrieved 2025-11-20, License: CC BY-SA
    MapTileLayer(
      id: 'google_hybrid',
      name: 'Google Hybrid',
      urlTemplate: 'http://mt0.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
      maxZoom: 20,
      attribution: '© Google Maps',
      description: 'Satelit dengan label jalan',
    ),

    MapTileLayer(
      id: 'google_satellit',
      name: 'Google Satellite',
      urlTemplate: 'http://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      maxZoom: 20,
      attribution: '© Google Maps',
      description: 'Citra satelit Google',
    ),

    // ArcGIS Tiles
    MapTileLayer(
      id: 'arcgis_light_gray',
      name: 'ArcGIS Light Gray',
      urlTemplate:
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      maxZoom: 16,
      attribution: 'Tiles © Esri — Esri, DeLorme, NAVTEQ',
      description: 'Tampilan minimalis abu-abu terang',
    ),
  ];

  /// Get tile by ID
  static MapTileLayer? getTileById(String id) {
    try {
      return availableTiles.firstWhere((tile) => tile.id == id);
    } catch (e) {
      return null;
    }
  }

  /// Default tile (ArcGIS Light Gray)
  static MapTileLayer get defaultTile =>
      getTileById('arcgis_light_gray') ?? availableTiles.first;
}
