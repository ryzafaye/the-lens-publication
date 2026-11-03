Get-ChildItem -Filter "mpc-*.html" | ForEach-Object {
    $name = $_.Name
    $content = Get-Content $_.FullName -Raw
    $pattern = 'class="sidebar-nav-item[^"]*"\s*(?:data-page="[^"]*")?>\s*<i[^>]*></i>\s*<span>([^<]+)</span>'
    $matches = [regex]::Matches($content, $pattern)
    $items = ($matches | ForEach-Object { $_.Groups[1].Value.Trim() }) -join ', '
    Write-Host "$name -> $items"
}

