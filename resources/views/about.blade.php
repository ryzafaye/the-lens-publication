@extends('layouts.public')

@section('title', 'About Us')

@section('content')
<main class="about-page page-shell max-w-7xl mx-auto px-6 py-10">

    <!-- Hero Section -->
    <section class="about-hero mb-16 flex flex-col md:flex-row items-center justify-between gap-8 py-8" aria-labelledby="about-title">
        <div class="about-hero-copy max-w-2xl">
            <p class="about-eyebrow text-xs font-bold tracking-widest text-rose-200 uppercase mb-2">INDEPENDENT STUDENT JOURNALISM</p>
            <h1 id="about-title" class="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
                The Lens <em class="text-rose-200 italic">Publication</em>
            </h1>
            <p class="about-hero-description text-base sm:text-lg text-white mb-6 leading-relaxed">
                The Official Student Journalism Body of Polytechnic University of the Philippines – Biñan Campus.
            </p>
            <a class="about-hero-cta inline-flex items-center gap-2 px-5 py-2.5 bg-white text-rose-950 text-xs font-bold rounded-lg hover:bg-rose-50 transition-colors shadow-sm" href="#leadership">
                <span>Meet our officers</span>
                <i class="fa-solid fa-arrow-down text-xs" aria-hidden="true"></i>
            </a>
        </div>
        <aside class="about-motto-card" aria-label="The Lens motto">
            <p class="motto-wordmark font-serif font-extrabold text-2xl sm:text-3xl text-white tracking-wide">
                <span class="block">Basta Lente,</span>
                <span class="block text-rose-200">Abante!</span>
            </p>
        </aside>
    </section>

    <!-- Who We Are Section -->
    <section class="about-intro-section mb-16 pt-12 border-t border-stone-200" aria-labelledby="about-intro-title">
        <div class="about-section-kicker text-xs font-bold tracking-widest text-wine uppercase mb-3">WHO WE ARE</div>
        <div class="about-intro-grid grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div class="md:col-span-1">
                <h2 id="about-intro-title" class="font-display text-2xl sm:text-3xl font-extrabold text-stone-900">
                    Stories that serve the campus.
                </h2>
            </div>
            <div class="about-intro-copy md:col-span-2 text-stone-600 text-sm leading-relaxed space-y-4">
                <p>
                    The Lens Publication is the official student journalism body of Polytechnic University of the Philippines – Biñan Campus. We document campus life and student perspectives through news, features, opinion, science and technology, literature, photography, and multimedia storytelling.
                </p>
                <p>
                    Our work is guided by curiosity, care for our community, and a commitment to clear and responsible student journalism.
                </p>
            </div>
        </div>

        <!-- Values Cards -->
        <div class="about-values-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            <article class="about-value-card p-6 rounded-xl border border-stone-200 bg-stone-50">
                <span class="about-value-icon text-2xl text-wine mb-3 block"><i class="fa-solid fa-newspaper" aria-hidden="true"></i></span>
                <h3 class="font-display font-bold text-base text-stone-900 mb-2">Campus reporting</h3>
                <p class="text-xs text-stone-600 leading-relaxed">Stories and information that help the campus community stay informed.</p>
            </article>
            <article class="about-value-card p-6 rounded-xl border border-stone-200 bg-stone-50">
                <span class="about-value-icon text-2xl text-wine mb-3 block"><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i></span>
                <h3 class="font-display font-bold text-base text-stone-900 mb-2">Editorial responsibility</h3>
                <p class="text-xs text-stone-600 leading-relaxed">Thoughtful coverage, careful review, and respect for context and accountability.</p>
            </article>
            <article class="about-value-card p-6 rounded-xl border border-stone-200 bg-stone-50">
                <span class="about-value-icon text-2xl text-wine mb-3 block"><i class="fa-solid fa-microphone-lines" aria-hidden="true"></i></span>
                <h3 class="font-display font-bold text-base text-stone-900 mb-2">Student voices</h3>
                <p class="text-xs text-stone-600 leading-relaxed">A space for student perspectives, creativity, inquiry, and meaningful conversation.</p>
            </article>
        </div>
    </section>

    <!-- Leadership Section -->
    <section class="about-team-section mb-16 pt-12 border-t border-stone-200" id="leadership" aria-labelledby="leadership-title">
        <div class="about-section-heading flex items-center justify-between pb-4 mb-6 border-b border-stone-200">
            <div>
                <p class="about-section-kicker text-xs font-bold tracking-widest text-wine uppercase">THE PEOPLE BEHIND THE STORIES</p>
                <h2 id="leadership-title" class="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">Publication Officers</h2>
            </div>
            <a class="about-outline-link text-xs font-bold text-wine border border-wine px-4 py-2 rounded-lg hover:bg-rose-50 transition-colors" href="{{ route('public.members') }}">
                See all members →
            </a>
        </div>
        <div class="about-subsection-heading flex items-center gap-3 mb-6 text-stone-500 text-xs font-medium">
            <span class="font-bold text-wine">01</span>
            <div>
                <h3 class="text-stone-900 font-bold text-sm">Executive Board</h3>
                <p>Publication officers</p>
            </div>
        </div>

        <div id="executive-grid" class="people-grid grid grid-cols-2 sm:grid-cols-4 gap-6">
            @php
                $executives = [
                    ['role' => 'President', 'name' => 'Publication President'],
                    ['role' => 'Vice President', 'name' => 'Publication Vice President'],
                    ['role' => 'Secretary', 'name' => 'Publication Secretary'],
                    ['role' => 'Associate Secretary', 'name' => 'Publication Assoc. Secretary'],
                    ['role' => 'Associate Secretary', 'name' => 'Publication Assoc. Secretary'],
                    ['role' => 'Treasurer', 'name' => 'Publication Treasurer'],
                    ['role' => 'Auditor', 'name' => 'Publication Auditor'],
                    ['role' => 'Public Relations Officer', 'name' => 'Public Relations Officer'],
                ];
            @endphp
            @foreach($executives as $officer)
                <article class="member-profile-card text-center p-4 rounded-xl border border-stone-100 bg-white hover:border-stone-200 hover:shadow-sm transition-all">
                    <div class="member-profile-photo-wrap w-24 h-24 mx-auto rounded-full overflow-hidden mb-3 bg-stone-100 flex items-center justify-center border-2 border-stone-100">
                        <img class="member-profile-photo w-full h-full object-cover" src="{{ asset('images/member-placeholder.svg') }}" alt="{{ $officer['role'] }} profile photo" loading="lazy">
                    </div>
                    <div class="member-profile-info">
                        <p class="member-role-label text-[11px] font-bold text-wine uppercase tracking-wider mb-1">{{ $officer['role'] }}</p>
                        <h3 class="font-display font-semibold text-stone-900 text-xs sm:text-sm">{{ $officer['name'] }}</h3>
                    </div>
                </article>
            @endforeach
        </div>
    </section>

    <!-- Documents Section -->
    <section class="about-documents-section mb-16 pt-12 border-t border-stone-200" id="documents" aria-labelledby="documents-title">
        <div class="about-section-heading mb-8">
            <p class="about-section-kicker text-xs font-bold tracking-widest text-wine uppercase">DOCUMENT LIBRARY</p>
            <h2 id="documents-title" class="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">Financial Records &amp; Documents</h2>
            <p class="about-section-lead text-xs sm:text-sm text-stone-600 mt-1">Browse document formats and download the available files.</p>
        </div>

        <div id="document-library-grid" class="document-library-grid">
            <!-- Card 1: Financial Summary -->
            <article class="document-card" data-document-id="financial-summary">
                <!-- Document Mockup Preview Container -->
                <div class="relative bg-[#f8f2f5] p-5 pb-7 rounded-t-[15px] overflow-hidden border-b border-stone-200/60">
                    <div class="bg-white rounded-lg shadow-sm border border-stone-200/80 p-4 pt-3 flex flex-col items-center relative overflow-hidden w-full max-w-[240px] mx-auto min-h-[195px]">
                        <!-- Top Maroon Header Strip -->
                        <div class="w-full h-2 bg-[#571525] rounded-t mb-2.5"></div>
                        <h4 class="font-serif font-black text-xs text-stone-900 tracking-wider text-center uppercase">FINANCIAL SUMMARY</h4>
                        <p class="text-[8px] text-stone-400 font-bold tracking-widest text-center uppercase mt-0.5">INCOME / EXPENSES / BALANCE</p>
                        
                        <!-- Table Column Headings -->
                        <div class="w-full mt-3 bg-stone-100/90 border-y border-stone-200 py-1 px-1.5 flex items-center justify-between text-[7px] font-bold text-stone-500 uppercase tracking-tighter">
                            <span>DATE</span>
                            <span>ITEM</span>
                            <span>AMOUNT</span>
                            <span>REFERENCE</span>
                        </div>

                        <!-- Ruled Table Lines -->
                        <div class="w-full space-y-2 mt-2 px-0.5">
                            <div class="w-full h-1.5 bg-rose-900/10 rounded"></div>
                            <div class="w-full h-1.5 bg-rose-900/10 rounded"></div>
                            <div class="w-full h-1.5 bg-rose-900/10 rounded"></div>
                        </div>

                        <!-- Angled Sample Template Stamp -->
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div class="border-2 border-[#571525] text-[#571525] font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded transform -rotate-12 bg-white/95 shadow-sm">
                                SAMPLE TEMPLATE
                            </div>
                        </div>
                    </div>

                    <!-- Preview Document Trigger Button -->
                    <button type="button" class="document-preview-trigger absolute bottom-3 right-3 bg-[#571525] hover:bg-[#400817] text-white text-[10px] font-bold py-1.5 px-3 rounded-md flex items-center gap-1.5 shadow transition-colors cursor-pointer" data-doc-title="Financial Summary" data-doc-sub="Income / Expenses / Balance" data-doc-cols="Date, Item, Amount, Reference" data-doc-desc="An organized format for summarizing income, expenses, and the running balance for a reporting period." data-doc-file="{{ asset('documents/financial-summary-template.csv') }}">
                        <i class="fa-solid fa-up-right-and-down-left-from-center text-[9px]" aria-hidden="true"></i>
                        <span>Preview document</span>
                    </button>
                </div>

                <!-- Document Copy & Download Action -->
                <div class="document-card-copy">
                    <div>
                        <span class="document-file-type">
                            <i class="fa-regular fa-file-lines" aria-hidden="true"></i> CSV TEMPLATE
                        </span>
                        <h3>
                            <i class="fa-solid fa-chart-pie" aria-hidden="true"></i>
                            <span>Financial Summary</span>
                        </h3>
                        <p>An organized format for summarizing income, expenses, and the running balance for a reporting period.</p>
                    </div>
                    <a class="document-download-link" href="{{ asset('documents/financial-summary-template.csv') }}" download="the-lens-financial-summary-template.csv">
                        <i class="fa-solid fa-download" aria-hidden="true"></i>
                        <span>Download template</span>
                        <span class="badge">CSV</span>
                    </a>
                </div>
            </article>

            <!-- Card 2: Receipts & Disbursements -->
            <article class="document-card" data-document-id="receipts-disbursements">
                <!-- Document Mockup Preview Container -->
                <div class="relative bg-[#f8f2f5] p-5 pb-7 rounded-t-[15px] overflow-hidden border-b border-stone-200/60">
                    <div class="bg-white rounded-lg shadow-sm border border-stone-200/80 p-4 pt-3 flex flex-col items-center relative overflow-hidden w-full max-w-[240px] mx-auto min-h-[195px]">
                        <!-- Top Maroon Header Strip -->
                        <div class="w-full h-2 bg-[#571525] rounded-t mb-2.5"></div>
                        <h4 class="font-serif font-black text-xs text-stone-900 tracking-wider text-center uppercase">RECEIPTS &amp; DISBURSEMENTS</h4>
                        <p class="text-[8px] text-stone-400 font-bold tracking-widest text-center uppercase mt-0.5">TRANSACTION REGISTER</p>
                        
                        <!-- Table Column Headings -->
                        <div class="w-full mt-3 bg-stone-100/90 border-y border-stone-200 py-1 px-1.5 flex items-center justify-between text-[7px] font-bold text-stone-500 uppercase tracking-tighter">
                            <span>DATE</span>
                            <span>ITEM</span>
                            <span>AMOUNT</span>
                            <span>REFERENCE</span>
                        </div>

                        <!-- Ruled Table Lines -->
                        <div class="w-full space-y-2 mt-2 px-0.5">
                            <div class="w-full h-1.5 bg-rose-900/10 rounded"></div>
                            <div class="w-full h-1.5 bg-rose-900/10 rounded"></div>
                            <div class="w-full h-1.5 bg-rose-900/10 rounded"></div>
                        </div>

                        <!-- Angled Sample Template Stamp -->
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div class="border-2 border-[#571525] text-[#571525] font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded transform -rotate-12 bg-white/95 shadow-sm">
                                SAMPLE TEMPLATE
                            </div>
                        </div>
                    </div>

                    <!-- Preview Document Trigger Button -->
                    <button type="button" class="document-preview-trigger absolute bottom-3 right-3 bg-[#571525] hover:bg-[#400817] text-white text-[10px] font-bold py-1.5 px-3 rounded-md flex items-center gap-1.5 shadow transition-colors cursor-pointer" data-doc-title="Receipts & Disbursements" data-doc-sub="Transaction Register" data-doc-cols="Date, Item, Amount, Reference" data-doc-desc="A register for documenting funds received and approved payments with reference details." data-doc-file="{{ asset('documents/receipts-disbursements-template.csv') }}">
                        <i class="fa-solid fa-up-right-and-down-left-from-center text-[9px]" aria-hidden="true"></i>
                        <span>Preview document</span>
                    </button>
                </div>

                <!-- Document Copy & Download Action -->
                <div class="document-card-copy">
                    <div>
                        <span class="document-file-type">
                            <i class="fa-regular fa-file-lines" aria-hidden="true"></i> CSV TEMPLATE
                        </span>
                        <h3>
                            <i class="fa-solid fa-receipt" aria-hidden="true"></i>
                            <span>Receipts &amp; Disbursements</span>
                        </h3>
                        <p>A register for documenting funds received and approved payments with reference details.</p>
                    </div>
                    <a class="document-download-link" href="{{ asset('documents/receipts-disbursements-template.csv') }}" download="the-lens-receipts-disbursements-template.csv">
                        <i class="fa-solid fa-download" aria-hidden="true"></i>
                        <span>Download template</span>
                        <span class="badge">CSV</span>
                    </a>
                </div>
            </article>

            <!-- Card 3: Project Liquidation -->
            <article class="document-card" data-document-id="project-liquidation">
                <!-- Document Mockup Preview Container -->
                <div class="relative bg-[#f8f2f5] p-5 pb-7 rounded-t-[15px] overflow-hidden border-b border-stone-200/60">
                    <div class="bg-white rounded-lg shadow-sm border border-stone-200/80 p-4 pt-3 flex flex-col items-center relative overflow-hidden w-full max-w-[240px] mx-auto min-h-[195px]">
                        <!-- Top Maroon Header Strip -->
                        <div class="w-full h-2 bg-[#571525] rounded-t mb-2.5"></div>
                        <h4 class="font-serif font-black text-xs text-stone-900 tracking-wider text-center uppercase">PROJECT LIQUIDATION</h4>
                        <p class="text-[8px] text-stone-400 font-bold tracking-widest text-center uppercase mt-0.5">BUDGET / EXPENSES / BALANCE</p>
                        
                        <!-- Table Column Headings -->
                        <div class="w-full mt-3 bg-stone-100/90 border-y border-stone-200 py-1 px-1.5 flex items-center justify-between text-[7px] font-bold text-stone-500 uppercase tracking-tighter">
                            <span>DATE</span>
                            <span>ITEM</span>
                            <span>AMOUNT</span>
                            <span>REFERENCE</span>
                        </div>

                        <!-- Ruled Table Lines -->
                        <div class="w-full space-y-2 mt-2 px-0.5">
                            <div class="w-full h-1.5 bg-rose-900/10 rounded"></div>
                            <div class="w-full h-1.5 bg-rose-900/10 rounded"></div>
                            <div class="w-full h-1.5 bg-rose-900/10 rounded"></div>
                        </div>

                        <!-- Angled Sample Template Stamp -->
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div class="border-2 border-[#571525] text-[#571525] font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded transform -rotate-12 bg-white/95 shadow-sm">
                                SAMPLE TEMPLATE
                            </div>
                        </div>
                    </div>

                    <!-- Preview Document Trigger Button -->
                    <button type="button" class="document-preview-trigger absolute bottom-3 right-3 bg-[#571525] hover:bg-[#400817] text-white text-[10px] font-bold py-1.5 px-3 rounded-md flex items-center gap-1.5 shadow transition-colors cursor-pointer" data-doc-title="Project Liquidation" data-doc-sub="Budget / Expenses / Balance" data-doc-cols="Date, Item, Amount, Reference" data-doc-desc="A format for comparing an approved activity budget with documented project expenses." data-doc-file="{{ asset('documents/project-liquidation-template.csv') }}">
                        <i class="fa-solid fa-up-right-and-down-left-from-center text-[9px]" aria-hidden="true"></i>
                        <span>Preview document</span>
                    </button>
                </div>

                <!-- Document Copy & Download Action -->
                <div class="document-card-copy">
                    <div>
                        <span class="document-file-type">
                            <i class="fa-regular fa-file-lines" aria-hidden="true"></i> CSV TEMPLATE
                        </span>
                        <h3>
                            <i class="fa-solid fa-file-invoice-dollar" aria-hidden="true"></i>
                            <span>Project Liquidation</span>
                        </h3>
                        <p>A format for comparing an approved activity budget with documented project expenses.</p>
                    </div>
                    <a class="document-download-link" href="{{ asset('documents/project-liquidation-template.csv') }}" download="the-lens-project-liquidation-template.csv">
                        <i class="fa-solid fa-download" aria-hidden="true"></i>
                        <span>Download template</span>
                        <span class="badge">CSV</span>
                    </a>
                </div>
            </article>
        </div>
    </section>

    <!-- Document Preview Modal Dialog -->
    <dialog id="document-preview-dialog" class="document-preview-dialog max-w-2xl w-full rounded-2xl p-0 shadow-2xl border border-stone-200 backdrop:bg-black/60">
        <div class="document-preview-dialog-shell bg-white rounded-2xl overflow-hidden flex flex-col">
            <div class="document-preview-dialog-header flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50">
                <div class="flex items-center gap-2.5">
                    <span class="w-8 h-8 rounded-full bg-rose-900/10 text-wine flex items-center justify-center text-sm font-bold">
                        <i class="fa-regular fa-file-lines"></i>
                    </span>
                    <div>
                        <h2 id="modal-doc-title" class="font-display font-extrabold text-base text-stone-900">Document Template</h2>
                        <p id="modal-doc-sub" class="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">CSV Preview</p>
                    </div>
                </div>
                <button type="button" id="close-doc-preview" class="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-600 flex items-center justify-center transition-colors text-xs font-bold" aria-label="Close dialog">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="p-6 overflow-y-auto max-h-[70vh] bg-stone-50/50">
                <p id="modal-doc-desc" class="text-xs text-stone-600 mb-4 leading-relaxed"></p>
                <div class="bg-white rounded-xl border border-stone-200 p-4 shadow-sm overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead>
                            <tr id="modal-doc-table-head" class="border-b border-stone-200 text-stone-700 font-bold uppercase text-[11px]"></tr>
                        </thead>
                        <tbody id="modal-doc-table-body" class="divide-y divide-stone-100 text-stone-600"></tbody>
                    </table>
                </div>
            </div>
            <div class="p-4 border-t border-stone-200 bg-white flex items-center justify-end gap-3">
                <button type="button" id="modal-doc-close-btn" class="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded-lg text-xs font-bold text-stone-700 transition-colors">
                    Close
                </button>
                <a id="modal-doc-download-btn" href="#" download="" class="px-4 py-2 bg-wine hover:bg-rose-950 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm">
                    <i class="fa-solid fa-download"></i>
                    <span>Download Template</span>
                </a>
            </div>
        </div>
    </dialog>

    <!-- Socials Card -->
    <section class="about-social-section mb-12" id="socials" aria-label="The Lens official Facebook page">
        <a class="facebook-page-card flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-[#1877F2]/10 via-[#1877F2]/5 to-transparent border border-[#1877F2]/20 hover:border-[#1877F2]/40 transition-colors" href="https://www.facebook.com/profile.php?id=61560889387183" target="_blank" rel="noopener noreferrer">
            <div class="flex items-center gap-4">
                <img class="facebook-page-avatar w-14 h-14 rounded-full border-2 border-white shadow-sm" src="{{ asset('images/logo.jpg') }}" alt="The Lens Publication logo" loading="lazy">
                <div class="facebook-page-copy">
                    <span class="facebook-page-platform text-[11px] font-bold text-[#1877F2] uppercase tracking-wider block mb-1">
                        <i class="fa-brands fa-facebook-f mr-1" aria-hidden="true"></i> OFFICIAL FACEBOOK PAGE
                    </span>
                    <strong class="facebook-page-title font-display text-lg sm:text-xl font-bold text-stone-900 block">The Lens Publication</strong>
                    <span class="facebook-page-subtitle text-xs text-stone-500">Campus stories, announcements, and publication updates.</span>
                </div>
            </div>
            <span class="facebook-page-action text-xs font-bold text-[#1877F2] flex items-center gap-1.5">
                <span>Visit Page</span>
                <i class="fa-solid fa-arrow-up-right-from-square text-xs" aria-hidden="true"></i>
            </span>
        </a>
    </section>

    <!-- Contact Section -->
    <section class="about-contact-section p-8 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center gap-6" id="contact" aria-labelledby="contact-title">
        <div class="about-contact-icon text-3xl text-wine bg-rose-900/10 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fa-regular fa-envelope" aria-hidden="true"></i>
        </div>
        <div class="text-center sm:text-left flex-grow">
            <p class="about-section-kicker text-xs font-bold tracking-widest text-wine uppercase mb-1">CONTACT THE PUBLICATION</p>
            <h2 id="contact-title" class="font-display text-xl sm:text-2xl font-bold text-stone-900 mb-2">Get in touch with The Lens</h2>
            <p class="text-xs text-stone-600 mb-3 max-w-xl">For inquiries, news tips, and publication-related correspondence, reach us through our official email address.</p>
            <a class="contact-email-link inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-wine hover:underline" href="mailto:thelenspublicationpupbc@gmail.com">
                <span>thelenspublicationpupbc@gmail.com</span>
                <i class="fa-solid fa-arrow-up-right-from-square text-xs" aria-hidden="true"></i>
            </a>
        </div>
    </section>

</main>

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function () {
        const dialog = document.getElementById('document-preview-dialog');
        const closeBtn = document.getElementById('close-doc-preview');
        const modalCloseBtn = document.getElementById('modal-doc-close-btn');
        const modalTitle = document.getElementById('modal-doc-title');
        const modalSub = document.getElementById('modal-doc-sub');
        const modalDesc = document.getElementById('modal-doc-desc');
        const modalHead = document.getElementById('modal-doc-table-head');
        const modalBody = document.getElementById('modal-doc-table-body');
        const modalDownload = document.getElementById('modal-doc-download-btn');

        document.querySelectorAll('.document-preview-trigger').forEach(button => {
            button.addEventListener('click', function () {
                const title = this.getAttribute('data-doc-title') || 'Document Preview';
                const sub = this.getAttribute('data-doc-sub') || 'CSV Template';
                const desc = this.getAttribute('data-doc-desc') || '';
                const cols = (this.getAttribute('data-doc-cols') || 'Date, Item, Amount, Reference').split(',').map(s => s.trim());
                const file = this.getAttribute('data-doc-file') || '#';

                if (modalTitle) modalTitle.textContent = title;
                if (modalSub) modalSub.textContent = sub;
                if (modalDesc) modalDesc.textContent = desc;
                if (modalDownload) {
                    modalDownload.href = file;
                    modalDownload.download = file.split('/').pop() || 'template.csv';
                }

                if (modalHead) {
                    modalHead.innerHTML = cols.map(c => `<th class="py-2.5 px-3 bg-stone-100/70">${c}</th>`).join('');
                }
                if (modalBody) {
                    modalBody.innerHTML = [
                        ['2026-10-01', 'Editorial Printing Supplies', 'PHP 2,450.00', 'REC-2026-001'],
                        ['2026-10-08', 'Coverage Logistics', 'PHP 1,200.00', 'REC-2026-002'],
                        ['2026-10-15', 'Production Outreach Workshop', 'PHP 4,300.00', 'REC-2026-003'],
                        ['2026-10-22', 'Audio/Podcast Equipment Repair', 'PHP 1,850.00', 'REC-2026-004']
                    ].map(row => `
                        <tr class="hover:bg-stone-50 transition-colors">
                            ${row.map(cell => `<td class="py-2 px-3 font-mono text-[11px]">${cell}</td>`).join('')}
                        </tr>
                    `).join('');
                }

                if (dialog && !dialog.open) {
                    dialog.showModal();
                }
            });
        });

        function closePreview() {
            if (dialog && dialog.open) {
                dialog.close();
            }
        }

        if (closeBtn) closeBtn.addEventListener('click', closePreview);
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closePreview);
        if (dialog) {
            dialog.addEventListener('click', function (e) {
                const rect = dialog.getBoundingClientRect();
                const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height
                    && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
                if (!isInDialog) {
                    dialog.close();
                }
            });
        }
    });
</script>
@endpush
@endsection
