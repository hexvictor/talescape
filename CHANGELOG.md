# Changelog

All notable changes to Talescape will be documented in this file.

This project uses three-number Semantic Versioning: `major.minor.patch`.

Changelog entries are added when a feature, fix, or meaningful change is finished and approved for release notes.

## Unreleased

## 1.6.0 - 2026-07-03

### Added

- Added configurable virtual reader input settings in Reader Hub for keyboard, wheel, touch, middle-drag, and snap behavior.
- Added middle-button drag scrolling for the reader.
- Added weighted wheel streak controls so larger repeated wheel movement can accelerate more than small wheel turns.

### Changed

- Reworked reader scrolling around a GSAP-backed virtual scroll driver while keeping the reader camera as the source of truth.
- Tuned reader wheel, keyboard, touch, and momentum defaults for smoother input behavior.
