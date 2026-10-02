
// Helper functions
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const fmt = d => {
    try {
        return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return d; }
};

const mins = a => {
    const textBody = Array.isArray(a.body) ? a.body.join(' ') : (typeof a.body === 'string' ? a.body : '');
    return Math.max(1, Math.round(textBody.split(/\s+/).length / 200));
};

const card = a => `<a class="card" href="#/a/${esc(a.id)}">
    ${a.cover ? `<img class="thumb" src="${a.cover}" alt="">` : ''}
    <span class="k">${esc(a.section)}</span>
    <h3>${esc(a.title)}</h3>
    <p>${esc(a.excerpt)}</p>
    <small>${esc(a.author)} · ${fmt(a.date)}</small>
    </a>`;

const list = (arr, t) => arr.length ? `<div class="grid">${arr.map(card).join('')}</div>` : `<div class="empty">${t || 'No articles found.'}</div>`;

function nav(cur) {
    $('#nav').html(`<a href="#/" class="${cur === '/' ? 'on' : ''}">Home</a>` + 
        SEC.map(s => `<a href="#/s/${encodeURIComponent(s)}" class="${cur === s ? 'on' : ''}">${s}</a>`).join('') +
        `<a href="#/search" class="${cur === 'search' ? 'on' : ''}">Search</a>` +
        `<a href="#/about" class="${cur === 'about' ? 'on' : ''}">About</a>`);
}