# Files to remove before pushing to production

- download-rural-farmer-avatars.mjs: Used only for scraping avatars, not needed in production.
- download-brand-logos.mjs: Used for initial logo download, not needed in production.
- generate-brand-logos.mjs: Used for generating brand logo variants, not needed in production.
- generate-icons.mjs: Used for generating icon assets, not needed in production.
- verify-logos.mjs: Used for asset verification, not needed in production.

You can safely delete these from the scripts/ folder before pushing to production.

If you want to keep any for future asset updates, move them outside the repo or add them to .gitignore.
