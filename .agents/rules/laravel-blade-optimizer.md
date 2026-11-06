---
trigger: always_on
---
# Laravel & Blade Performance and Code Optimization Rules

Apply this two-stage generator-optimizer standard to every code generation, refactoring, and debugging task in this workspace.

## 1. Backend (Laravel PHP) Invariants

- **N+1 Query Prevention:**
  - Always eager-load relationships (`with()`, `loadMissing()`) when relations will be accessed in loops, resources, or Blade views.
  - Constrain relation queries and select only necessary columns (e.g., `select(['id', 'user_id', 'title'])`). Always include primary and foreign keys required to hydrate the relation.
- **Memory & Collection Efficiency:**
  - Never call `->all()` or `->get()` on unbounded tables. Use `lazy()`, `cursor()`, or `chunkById()` for large datasets.
  - Offload sorting, filtering, aggregations (`count()`, `sum()`, `exists()`) to the database query builder rather than performing them on PHP `Collection` instances.
- **Architectural Separation:**
  - Keep Controllers thin: validation belongs in dedicated `FormRequest` classes; complex business logic belongs in Action or Service classes.
  - Return formatted data using API Resources (`JsonResource`) or clean view view-models.
- **Modern PHP Standards:**
  - Enforce `declare(strict_types=1);` at the top of all PHP files.
  - Use constructor property promotion, explicit method argument types, return types, and `readonly` properties where applicable.
- **Caching & Side Effects:**
  - Wrap repetitive read queries in `Cache::remember()`.
  - Dispatch slow tasks (emails, third-party APIs, file generation) to queued jobs implementing `ShouldQueue`.

## 2. Frontend (Blade & UI) Invariants

- **Logic-Free Views:**
  - Keep `.blade.php` templates declarative. Do not execute database queries or complex business operations inside `@php ... @endphp` tags. All data must be passed pre-formatted from the controller or view composer.
- **Blade Components:**
  - Encapsulate reusable UI fragments into anonymous or class-based components (`<x-button>`, `<x-card>`, `<x-layout>`) rather than fragmented `@include` calls.
- **Native Directives & Flow:**
  - Use native directives instead of verbose PHP conditionals:
    - `@forelse ... @empty ... @endforelse` instead of `@if(count()) @foreach`
    - `@class(['base-class', 'conditional-class' => $condition])` for dynamic class bindings
    - Form helpers: `@csrf`, `@method('PUT|PATCH|DELETE')`, `@error('field') ... @enderror`
    - Form state: `@checked($bool)`, `@selected($bool)`, `@disabled($bool)`
- **Security & Escaping:**
  - Always use default `{{ $value }}` escaping.
  - Reserve `{!! $value !!}` strictly for sanitized, trusted HTML content and document why unescaped output is necessary.
- **Asset Integration:**
  - Reference assets and scripts exclusively via the Vite directive: `@vite(['resources/css/app.css', 'resources/js/app.js'])`.

## 3. Response & Output Protocol

When generating or editing code:
1. Provide the complete, production-ready implementation first.
2. Append a brief 2 to 3 bullet point **Optimization Summary** highlighting:
   - Query efficiency or N+1 prevention applied.
   - Blade component or directive refactors.
   - Verification command to test the change (e.g., `php artisan test`, `./vendor/bin/pint`, or `./vendor/bin/phpstan`).