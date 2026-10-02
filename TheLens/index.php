<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The Lens Publication</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css?v=<?= filemtime(__DIR__ . '/css/styles.css') ?>">
<script>
  (function() {
    const t = localStorage.getItem('lens_theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
  })();
</script>
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
</head>
<body>
<div class="utility-bar"><div class="wrap"><span id="clock"></span></div></div>
<header><div class="wrap">
  <div class="top">
    <a class="brand" href="#/"><img class="logo" src="sources/logo.png" alt="The Lens logo">The Lens</a>
    <div class="tools">
      <input id="q" type="search" placeholder="Search articles…" aria-label="Search">
      <button class="ghost" id="theme" aria-label="Toggle theme">◐</button>
      <span id="auth" class="auth"></span>
    </div>
  </div>
  <nav id="nav"></nav>
</div></header>
<main><div class="wrap" id="app"></div></main>
<footer><div class="wrap">© <span id="yr"></span> The Lens Publication · The official student journalism club publication · <a href="#/about" style="text-decoration:underline">About</a></div></footer>


<script src="js/data.js?v=<?= filemtime(__DIR__ . '/js/data.js') ?>"></script>
<script src="js/helpers.js?v=<?= filemtime(__DIR__ . '/js/helpers.js') ?>"></script>
<script src="js/state.js?v=<?= filemtime(__DIR__ . '/js/state.js') ?>"></script>
<script src="js/api.js?v=<?= filemtime(__DIR__ . '/js/api.js') ?>"></script>
<script src="js/auth.js?v=<?= filemtime(__DIR__ . '/js/auth.js') ?>"></script>
<script src="js/pages.js?v=<?= filemtime(__DIR__ . '/js/pages.js') ?>"></script>
<script src="js/router.js?v=<?= filemtime(__DIR__ . '/js/router.js') ?>"></script>
</body>
</html>