# Changelog

All notable changes to the Zephyr Figma Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-11

### Added
- Initial release of Zephyr Figma Plugin
- **Generate as Code (JSON Export)** feature
  - Recursive node traversal extracting complete hierarchy
  - Complete style extraction (fills, strokes, effects, opacity, corner radius)
  - Layout property extraction (auto layout, padding, spacing, alignment)
  - Typography extraction (font family, size, weight, line height, letter spacing)
  - Component metadata extraction (component ID, properties, main component references)
  - Dimension and positioning data
  - Constraints and clipping properties
  - JSON Schema validation support
  - Performance optimized for large component trees (100+ nodes)
  - Export typically completes in < 5 seconds for complex components
- **Extract as Image** feature
  - Multi-format export (PNG, SVG, JPG)
  - Configurable export scale (1x, 2x, 4x)
  - Automatic filename generation with timestamp
  - Metadata JSON export alongside images
- React-based UI with tabs for each feature
- Comprehensive documentation
  - README.md with full API reference
  - INSTALLATION.md with setup instructions
  - JSON export schema (schema/json-export.schema.json)
  - Example exports (button and card components)
- TypeScript support throughout
- Vite-based build system with hot reload
- Selection tracking and validation
- Error handling and progress feedback

### Technical Details
- Plugin API version: 1.0.0
- JSON export format version: 1.0.0
- Supports Figma Desktop application
- Private plugin (not published to Figma Community)
- Built with esbuild and Vite for optimal bundle size
- React 18 for UI
- Full TypeScript type safety

### Performance
- Simple components (< 10 children): < 100ms
- Medium complexity (10-50 children): 100-500ms
- High complexity (50-100 children): 500-2000ms
- Very large (100+ children): 2-5 seconds

### Known Limitations
- Requires single node selection (no multi-select)
- Image export uses sequential format processing
- Very deep hierarchies (100+ levels) may be slow
