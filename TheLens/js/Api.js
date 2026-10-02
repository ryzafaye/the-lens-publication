
function fetchArticles(callback) {
    $.ajax({
        url: 'api/articles.php',
        method: 'GET',
        dataType: 'json',
        cache: false,
        success: function(data) {
            cachedArticles = Array.isArray(data) && data.length ? data : seed;
            if (callback) callback();
        },
        error: function(xhr, status, error) {
            console.warn('Failed to fetch from database, falling back to seed data.', error);
            cachedArticles = seed; 
            if (callback) callback();
        }
    });
}

const all = () => cachedArticles;