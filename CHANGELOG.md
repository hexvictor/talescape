# Changelog

All notable changes to Talescape will be documented in this file.

This project uses three-number Semantic Versioning: `major.minor.patch`.

Changelog entries are added when a feature, fix, or meaningful change is finished and approved for release notes.

## Unreleased

## 1.7.1 - 2026-07-05

### Fixed

- Fixed Firefox theme contrast by replacing OKLCH theme tokens with RGB-backed CSS variables and adding Firefox-safe fallbacks for opacity-based UI colors.

## 1.7.0 - 2026-07-04

### Added

- Added directional reader snap behavior so blocks can snap when entered from the previous block, the next block, or both.
- Added smart group-edge block placement with horizontal alignment controls for left, center, and right placement inside the available viewport space.
- Added tale and block snap configuration controls for snap and scroll-snap behavior.

### Changed

- Improved snap input handling so extra wheel, keyboard, touch, and drag input can accelerate or bypass active snapping instead of hard-blocking scroll.
- Updated previous-visible block takeover animations to compose with each block's own animation state instead of replacing it.
- Improved mobile readability and touch usability for editor toolbars, Reader Hub, and Reader Contents sidebars.

### Fixed

- Fixed smart horizontal alignment being dropped when a saved tale was loaded from the database.

## 1.6.0 - 2026-07-03

### Added

- Added configurable virtual reader input settings in Reader Hub for keyboard, wheel, touch, middle-drag, and snap behavior.
- Added middle-button drag scrolling for the reader.
- Added weighted wheel streak controls so larger repeated wheel movement can accelerate more than small wheel turns.

### Changed

- Reworked reader scrolling around a GSAP-backed virtual scroll driver while keeping the reader camera as the source of truth.
- Tuned reader wheel, keyboard, touch, and momentum defaults for smoother input behavior.
