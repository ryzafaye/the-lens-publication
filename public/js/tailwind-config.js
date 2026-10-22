// Shared Tailwind (CDN) theme. Load right after the Tailwind script.
tailwind.config = {
    theme: {
        extend: {
            colors: { wine: "#700f2b", burgundy: "#4a091b" },
            fontFamily: { display: ["Playfair Display", "serif"], body: ["DM Sans", "sans-serif"] }
        }
    }
};
