# /optimize Workflow

1. Inspect the selected code or current file for Laravel performance bottlenecks (N+1 queries, unindexed lookups, memory bloat).
2. Inspect any associated `.blade.php` files for component modularity, directive cleanliness, and script/style separation.
3. Refactor the code adhering to strict types, Form Requests, and Blade components.
4. Run `./vendor/bin/pint --test` or appropriate linter if available.