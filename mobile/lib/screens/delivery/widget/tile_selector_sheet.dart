import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../models/map_tile.dart';
import '../../../providers/map_tile_provider.dart';

class TileSelectorSheet extends ConsumerWidget {
  const TileSelectorSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentTile = ref.watch(selectedTileProvider);

    return Container(
      height: 240,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 10,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Drag Handle
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 8),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                const Text(
                  'Jenis Peta',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, size: 20),
                  onPressed: () => Navigator.pop(context),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Horizontal Scrollable Tile Cards (Google Maps Style)
          Expanded(
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: MapTileLayers.availableTiles.length,
              itemBuilder: (context, index) {
                final tile = MapTileLayers.availableTiles[index];
                final isSelected = tile.id == currentTile.id;

                return GestureDetector(
                  onTap: () {
                    ref.read(mapTileProvider.notifier).selectTile(tile.id);
                    // Auto close after selection
                    Future.delayed(
                      const Duration(milliseconds: 300),
                      () => Navigator.pop(context),
                    );
                  },
                  child: Container(
                    width: 120,
                    margin: const EdgeInsets.only(right: 12, bottom: 8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected
                            ? const Color(0xFF7C3AED)
                            : Colors.grey.shade300,
                        width: isSelected ? 2.5 : 1,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: const Color(0xFF7C3AED).withOpacity(0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ]
                          : [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Preview Image (Mock)
                        Container(
                          height: 85,
                          decoration: BoxDecoration(
                            color: _getPreviewColor(tile.id),
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(11),
                            ),
                          ),
                          child: Stack(
                            children: [
                              // Preview icon
                              Center(
                                child: Icon(
                                  _getPreviewIcon(tile.id),
                                  size: 36,
                                  color: Colors.white.withOpacity(0.5),
                                ),
                              ),
                              // Check indicator
                              if (isSelected)
                                Positioned(
                                  top: 6,
                                  right: 6,
                                  child: Container(
                                    padding: const EdgeInsets.all(3),
                                    decoration: const BoxDecoration(
                                      color: Color(0xFF7C3AED),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.check,
                                      color: Colors.white,
                                      size: 14,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),

                        // Title
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 6,
                            ),
                            child: Text(
                              tile.name,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: isSelected
                                    ? FontWeight.w600
                                    : FontWeight.w500,
                                color: isSelected
                                    ? const Color(0xFF7C3AED)
                                    : Colors.black87,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // Helper untuk preview color
  Color _getPreviewColor(String tileId) {
    switch (tileId) {
      // Google Maps
      case 'google_streets':
        return const Color(0xFF4285F4); // Google Blue
      case 'google_satellite':
        return Colors.green.shade800;
      case 'google_hybrid':
        return Colors.teal.shade700;
      case 'google_terrain':
        return Colors.brown.shade500;
      // ArcGIS
      case 'arcgis_light_gray':
        return Colors.grey.shade400;
      case 'arcgis_streets':
        return Colors.orange.shade400;
      case 'arcgis_topo':
        return Colors.brown.shade400;
      // CartoDB
      case 'cartodb_positron':
        return Colors.grey.shade300;
      default:
        return Colors.blue.shade400;
    }
  }

  // Helper untuk preview icon
  IconData _getPreviewIcon(String tileId) {
    switch (tileId) {
      // Google Maps
      case 'google_streets':
        return Icons.navigation;
      case 'google_satellite':
        return Icons.satellite_alt;
      case 'google_hybrid':
        return Icons.layers;
      case 'google_terrain':
        return Icons.terrain;
      // ArcGIS
      case 'arcgis_topo':
        return Icons.landscape;
      default:
        return Icons.map;
    }
  }
}

/// Helper function untuk show tile selector
void showTileSelector(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => const TileSelectorSheet(),
  );
}
