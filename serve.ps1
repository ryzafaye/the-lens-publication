Write-Host "Starting The Lens Development Server (4 Multi-Threaded Workers)..." -ForegroundColor Green
$env:PHP_CLI_SERVER_WORKERS = 4
php artisan serve --host=127.0.0.1 --port=8000
