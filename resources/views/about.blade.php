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
            <p class="about-section-lead text-xs sm:text-sm text-stone-600 mt-1">Browse transparency records, reports, and publication guidelines.</p>
        </div>

        <div id="document-library-grid" class="document-library-grid">
            <!-- Card 1: Financial Summary -->
            <article class="document-card" data-document-id="financial-summary">
                <div class="document-card-copy">
                    <div>
                        <span class="document-file-type">
                            <i class="fa-regular fa-file-lines" aria-hidden="true"></i> Financial Record
                        </span>
                        <h3>
                            <i class="fa-solid fa-chart-pie" aria-hidden="true"></i>
                            <span>Financial Summary</span>
                        </h3>
                        <p>An organized summary of publication receipts, operating expenses, and financial balance.</p>
                        <div class="mb-4 text-[11px] text-stone-500 flex items-center gap-1.5 font-medium">
                            <i class="fa-solid fa-circle-check text-rose-900 text-[10px]" aria-hidden="true"></i>
                            <span>Published quarterly by Executive Office</span>
                        </div>
                    </div>
                    <a class="document-download-link" href="{{ asset('documents/financial-summary-template.csv') }}" download="the-lens-financial-summary-template.csv">
                        <i class="fa-solid fa-download" aria-hidden="true"></i>
                        <span>Download CSV Template</span>
                        <span>.CSV</span>
                    </a>
                </div>
            </article>

            <!-- Card 2: Receipts & Disbursements -->
            <article class="document-card" data-document-id="receipts-disbursements">
                <div class="document-card-copy">
                    <div>
                        <span class="document-file-type">
                            <i class="fa-regular fa-file-lines" aria-hidden="true"></i> Transparency Report
                        </span>
                        <h3>
                            <i class="fa-solid fa-receipt" aria-hidden="true"></i>
                            <span>Receipts &amp; Disbursements</span>
                        </h3>
                        <p>Official register of funds received and authorized expenditures with audit records.</p>
                        <div class="mb-4 text-[11px] text-stone-500 flex items-center gap-1.5 font-medium">
                            <i class="fa-solid fa-circle-check text-rose-900 text-[10px]" aria-hidden="true"></i>
                            <span>Audited by Publication Auditor</span>
                        </div>
                    </div>
                    <a class="document-download-link" href="{{ asset('documents/receipts-disbursements-template.csv') }}" download="the-lens-receipts-disbursements-template.csv">
                        <i class="fa-solid fa-download" aria-hidden="true"></i>
                        <span>Download CSV Template</span>
                        <span>.CSV</span>
                    </a>
                </div>
            </article>

            <!-- Card 3: Project Liquidation -->
            <article class="document-card" data-document-id="project-liquidation">
                <div class="document-card-copy">
                    <div>
                        <span class="document-file-type">
                            <i class="fa-regular fa-file-lines" aria-hidden="true"></i> Activity Report
                        </span>
                        <h3>
                            <i class="fa-solid fa-file-invoice-dollar" aria-hidden="true"></i>
                            <span>Project Liquidation</span>
                        </h3>
                        <p>Documented coverage of publication projects, event workshops, and student outreach.</p>
                        <div class="mb-4 text-[11px] text-stone-500 flex items-center gap-1.5 font-medium">
                            <i class="fa-solid fa-circle-check text-rose-900 text-[10px]" aria-hidden="true"></i>
                            <span>Maintained by Editorial Board</span>
                        </div>
                    </div>
                    <a class="document-download-link" href="{{ asset('documents/project-liquidation-template.csv') }}" download="the-lens-project-liquidation-template.csv">
                        <i class="fa-solid fa-download" aria-hidden="true"></i>
                        <span>Download CSV Template</span>
                        <span>.CSV</span>
                    </a>
                </div>
            </article>
        </div>
    </section>

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
@endsection
