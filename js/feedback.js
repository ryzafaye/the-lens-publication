import { PUBLICATION_CONFIG } from "./site-config.js";

const STORAGE_KEY = "theLensFeedbackDemoSubmissions";
const MAX_MESSAGE_LENGTH = 3000;

function escapeMailBody(value) {
    return String(value ?? "").replace(/\r?\n/g, "\r\n");
}

function buildMailto({ name, subject, message }) {
    const emailSubject = `[The Lens Feedback] ${subject}`;
    const emailBody = [
        `Name: ${name || "Not provided"}`,
        "",
        "Message:",
        message
    ].join("\n");
    return `mailto:${PUBLICATION_CONFIG.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(escapeMailBody(emailBody))}`;
}

function showFieldError(form, fieldName, message) {
    const field = form.elements.namedItem(fieldName);
    const error = form.querySelector(`[data-error-for="feedback-${fieldName}"]`);
    if (field) {
        field.setAttribute("aria-invalid", message ? "true" : "false");
        field.classList.toggle("is-invalid", Boolean(message));
    }
    if (error) error.textContent = message || "";
}

export function initFeedbackForm() {
    const form = document.getElementById("editor-feedback-form");
    if (!form || form.dataset.initialized === "true") return;
    form.dataset.initialized = "true";

    const nameInput = form.elements.namedItem("name");
    const subjectInput = form.elements.namedItem("subject");
    const messageInput = form.elements.namedItem("message");
    const messageCounter = document.getElementById("feedback-message-count");
    const successPanel = document.getElementById("feedback-success");
    const emailDraftLink = document.getElementById("feedback-email-draft");
    const newMessageButton = document.getElementById("feedback-new-message");

    const updateCounter = () => {
        if (messageCounter) messageCounter.textContent = `${messageInput.value.length} / ${MAX_MESSAGE_LENGTH}`;
    };
    updateCounter();
    messageInput.addEventListener("input", updateCounter);

    [[subjectInput, "subject"], [messageInput, "message"]].forEach(([field, name]) => {
        field.addEventListener("input", () => showFieldError(form, name, ""));
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        const name = String(nameInput.value || "").trim();
        const subject = String(subjectInput.value || "").trim();
        const message = String(messageInput.value || "").trim();
        let valid = true;

        if (!subject) {
            showFieldError(form, "subject", "Please enter a subject.");
            valid = false;
        } else showFieldError(form, "subject", "");

        if (!message) {
            showFieldError(form, "message", "Please write your feedback.");
            valid = false;
        } else if (message.length < 10) {
            showFieldError(form, "message", "Please provide a little more detail (at least 10 characters).");
            valid = false;
        } else showFieldError(form, "message", "");

        if (!valid) {
            form.querySelector('[aria-invalid="true"]')?.focus();
            return;
        }

        const submission = {
            id: `feedback-${Date.now()}`,
            name,
            subject,
            message,
            savedAt: new Date().toISOString(),
            delivery: "browser-demo-only"
        };

        // This frontend prototype cannot send data to a server. Keep a local demo
        // record and offer a prefilled email draft so the reader can deliver it.
        try {
            const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
            const safeExisting = Array.isArray(existing) ? existing : [];
            safeExisting.push(submission);
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeExisting.slice(-20)));
        } catch (error) {
            console.warn("Local feedback demo storage is unavailable.", error);
        }

        if (emailDraftLink) emailDraftLink.href = buildMailto({ name, subject, message });
        form.hidden = true;
        if (successPanel) {
            successPanel.hidden = false;
            successPanel.focus?.({ preventScroll: true });
        }
        successPanel?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    newMessageButton?.addEventListener("click", () => {
        form.reset();
        form.hidden = false;
        if (successPanel) successPanel.hidden = true;
        updateCounter();
        showFieldError(form, "subject", "");
        showFieldError(form, "message", "");
        subjectInput.focus();
    });
}
