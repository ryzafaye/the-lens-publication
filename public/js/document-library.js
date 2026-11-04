/* Reusable financial document cards and accessible full-size preview dialog. */
const documents = [
    {
        id: "financial-summary",
        title: "Financial Summary",
        description: "An organized format for summarizing income, expenses, and the running balance for a reporting period.",
        image: "images/financial-summary-preview.svg",
        alt: "Financial summary CSV template preview",
        download: "documents/financial-summary-template.csv",
        filename: "the-lens-financial-summary-template.csv",
        icon: "fa-chart-pie"
    },
    {
        id: "receipts-disbursements",
        title: "Receipts & Disbursements",
        description: "A register for documenting funds received and approved payments with reference details.",
        image: "images/receipts-preview.svg",
        alt: "Receipts and disbursements CSV template preview",
        download: "documents/receipts-disbursements-template.csv",
        filename: "the-lens-receipts-disbursements-template.csv",
        icon: "fa-receipt"
    },
    {
        id: "project-liquidation",
        title: "Project Liquidation",
        description: "A format for comparing an approved activity budget with documented project expenses.",
        image: "images/liquidation-preview.svg",
        alt: "Project liquidation CSV template preview",
        download: "documents/project-liquidation-template.csv",
        filename: "the-lens-project-liquidation-template.csv",
        icon: "fa-file-invoice-dollar"
    }
];

const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

function renderDocumentCard(documentRecord) {
    const title = escapeHTML(documentRecord.title);
    const image = escapeHTML(documentRecord.image);
    const alt = escapeHTML(documentRecord.alt);
    const download = escapeHTML(documentRecord.download);
    const filename = escapeHTML(documentRecord.filename);
    const description = escapeHTML(documentRecord.description);
    const icon = escapeHTML(documentRecord.icon);

    return `
        <article class="document-card" data-document-id="${escapeHTML(documentRecord.id)}">
            <button type="button" class="document-preview-button" data-document-preview="true"
                data-document-title="${title}" data-document-src="${image}" data-document-alt="${alt}"
                aria-label="Preview ${title}">
                <img src="${image}" alt="${alt}" loading="lazy">
                <span class="document-preview-action"><i class="fa-solid fa-up-right-and-down-left-from-center" aria-hidden="true"></i> Preview document</span>
            </button>
            <div class="document-card-copy">
                <span class="document-file-type"><i class="fa-regular fa-file-lines" aria-hidden="true"></i> CSV template</span>
                <h3><i class="fa-solid ${icon}" aria-hidden="true"></i>${title}</h3>
                <p>${description}</p>
                <a class="document-download-link" href="${download}" download="${filename}">
                    <i class="fa-solid fa-download" aria-hidden="true"></i> Download template <span>CSV</span>
                </a>
            </div>
        </article>`;
}

function ensurePreviewDialog() {
    let dialog = document.getElementById("document-preview-dialog");
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.id = "document-preview-dialog";
    dialog.className = "document-preview-dialog";
    dialog.setAttribute("aria-labelledby", "document-preview-title");
    dialog.innerHTML = `
        <div class="document-preview-dialog-shell">
            <header class="document-preview-dialog-header">
                <h2 id="document-preview-title">Document preview</h2>
                <button type="button" class="document-preview-close" aria-label="Close document preview" title="Close preview">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
            </header>
            <div class="document-preview-stage"><img class="document-preview-full-image" alt=""></div>
        </div>`;

    dialog.querySelector(".document-preview-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
        const opener = document.querySelector("[data-document-preview].is-preview-opener");
        if (opener) {
            opener.classList.remove("is-preview-opener");
            opener.focus({ preventScroll: true });
        }
    });
    document.body.append(dialog);
    return dialog;
}

function openDocumentPreview(button) {
    const dialog = ensurePreviewDialog();
    const image = dialog.querySelector(".document-preview-full-image");
    dialog.querySelector("#document-preview-title").textContent = button.dataset.documentTitle || "Document preview";
    image.src = button.dataset.documentSrc || "";
    image.alt = button.dataset.documentAlt || "Document preview";
    document.querySelectorAll("[data-document-preview].is-preview-opener").forEach(item => item.classList.remove("is-preview-opener"));
    button.classList.add("is-preview-opener");
    if (!dialog.open) dialog.showModal();
}

export function initDocumentLibrary() {
    const container = document.getElementById("document-library-grid");
    if (!container) return;

    if (container.dataset.rendered !== "true") {
        container.innerHTML = documents.map(renderDocumentCard).join("");
        container.dataset.rendered = "true";
    }

    ensurePreviewDialog();
    if (!container.dataset.listenerReady) {
        container.addEventListener("click", event => {
            const previewButton = event.target.closest("[data-document-preview]");
            if (previewButton) openDocumentPreview(previewButton);
        });
        container.dataset.listenerReady = "true";
    }
}
