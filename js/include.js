// Shared HTML snippets stay in the project root and are fetched by the page shell.
// Use a local web server; fetch does not work from file://.
export async function includePartials(root = document) {
    const slots = [...root.querySelectorAll("[data-include]")];
    await Promise.all(slots.map(async slot => {
        try {
            const response = await fetch(slot.dataset.include);
            if (!response.ok) throw new Error(response.status);
            slot.innerHTML = await response.text();
            slot.removeAttribute("data-include");
        } catch (error) {
            console.error("Could not load partial:", slot.dataset.include, error);
        }
    }));
}
