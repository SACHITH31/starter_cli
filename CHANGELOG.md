# Changelog

All notable changes to stack-starter-cli are documented here.

## [1.3.0] - 2026-11-20

### Added
- Opt-in `--ts` TypeScript scaffolding for React (Vite), Express, and fullstack projects.
- Generated TypeScript backend build and development scripts.
- Automated CLI regression tests and real generated-project build smoke tests in GitHub Actions.

### Fixed
- Reject extra positional project names and repeated value-taking CLI flags.
- Improve validation for invalid option combinations.
- Clean up incomplete projects when React or backend installation fails.
- Recheck target directory existence before scaffolding to avoid overwriting a project.

### Compatibility
- JavaScript remains the default; existing HTML, React, and Express templates remain supported.
- No intentional breaking changes.

## [1.2.0] - 2026-05-13

Previous published release. See GitHub Releases for its historical notes.
