/* Central publication identity/contact settings used across the public site. */
export const PUBLICATION_CONFIG = Object.freeze({
    email: "thelenspublicationpupbc@gmail.com",
    facebookUrl: "https://www.facebook.com/profile.php?id=61560889387183"
});

export function applyPublicationLinks(root = document) {
    root.querySelectorAll('[data-publication-link="facebook"]').forEach(link => {
        link.href = PUBLICATION_CONFIG.facebookUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
    });

    root.querySelectorAll('[data-publication-link="email"]').forEach(link => {
        link.href = `mailto:${PUBLICATION_CONFIG.email}`;
    });
}
