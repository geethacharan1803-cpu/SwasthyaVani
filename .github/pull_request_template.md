## Summary of Changes
Provide a brief summary of the changes proposed in this Pull Request.

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking enhancement for frontline workers)
- [ ] Documentation update
- [ ] Clinical protocol update / translation improvement
- [ ] CI / Build configuration

## Verification & Testing
Please verify that:
- [ ] Web unit tests passed (`npm test --prefix web`)
- [ ] Web linter passed (`npm run lint --prefix web`)
- [ ] Web production build succeeded (`npm run build --prefix web`)
- [ ] Python tests passed (`pytest pipeline/tests/`)
- [ ] Python ruff linter passed (`ruff check pipeline/`)
- [ ] Data integrity audit passed (`python pipeline/src/swasthyavani/verify_integrity.py`)
- [ ] Verified zero emojis / icons in UI components

