@extends('layouts.public')

@section('title', 'Feedback to the Editor')

@section('content')
<main class="feedback-page page-shell max-w-7xl mx-auto px-6 py-10" data-page="feedback">

    <section class="feedback-main-grid grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16" aria-labelledby="feedback-title">
        <!-- Intro Column -->
        <div class="feedback-intro-copy lg:col-span-5 flex flex-col justify-between">
            <div>
                <p class="feedback-eyebrow text-xs font-bold tracking-widest text-wine uppercase mb-2">THE LENS PUBLICATION</p>
                <h1 id="feedback-title" class="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight mb-4">
                    Feedback to the Editor
                </h1>
                <p class="text-sm text-stone-600 leading-relaxed mb-6">
                    Have a suggestion, concern, correction, or thought about our coverage? Send a note to The Lens. We value respectful reader feedback that helps us serve the campus community better.
                </p>
                <div class="feedback-intro-rule" aria-hidden="true"><span></span></div>
            </div>

            <!-- Animated Envelope Scene -->
            <div class="feedback-envelope-scene" aria-hidden="true">
                <span class="feedback-envelope-spark feedback-envelope-spark-one">✦</span>
                <span class="feedback-envelope-spark feedback-envelope-spark-two">✧</span>
                <span class="feedback-envelope-spark feedback-envelope-spark-three">✦</span>
                <div class="feedback-envelope-art">
                    <div class="feedback-envelope-letter">
                        <span></span><span></span><span></span>
                        <i class="fa-regular fa-heart"></i>
                    </div>
                    <div class="feedback-envelope-back"></div>
                    <div class="feedback-envelope-flap"></div>
                    <div class="feedback-envelope-front"></div>
                    <span class="feedback-envelope-seal"><i class="fa-regular fa-envelope"></i></span>
                </div>
            </div>

            <p class="feedback-small-note text-xs text-stone-500 flex items-center gap-2">
                <i class="fa-regular fa-envelope text-wine" aria-hidden="true"></i>
                <span>Your feedback helps us keep campus journalism open, thoughtful, and accountable.</span>
            </p>
        </div>

        <!-- Form Card Column -->
        <div class="feedback-form-card lg:col-span-7 bg-white p-6 sm:p-10 rounded-2xl border border-stone-200 shadow-sm">
            @if(session('success'))
                <div class="feedback-success mb-6 p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900" role="alert">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                            <i class="fa-solid fa-check"></i>
                        </span>
                        <h2 class="font-display font-bold text-base text-emerald-950">Your feedback has been received!</h2>
                    </div>
                    <p class="text-xs text-emerald-800 leading-relaxed pl-11">
                        Thank you for sharing your thoughts with the editorial board. Your message has been safely logged in the publication inbox.
                    </p>
                </div>
            @endif

            <form id="editor-feedback-form" action="{{ route('public.feedback.post') }}" method="POST" class="editor-feedback-form space-y-6">
                @csrf
                <div class="feedback-form-heading flex items-center gap-3 pb-4 border-b border-stone-100">
                    <span class="feedback-form-icon w-10 h-10 rounded-full bg-rose-900/10 text-wine flex items-center justify-center text-sm">
                        <i class="fa-regular fa-paper-plane" aria-hidden="true"></i>
                    </span>
                    <div>
                        <h2 class="font-display font-bold text-lg text-stone-900">Send your message</h2>
                        <p class="text-xs text-stone-500">Fields marked with an asterisk (<span class="text-wine font-bold">*</span>) are required.</p>
                    </div>
                </div>

                <div class="feedback-field">
                    <label for="feedback-name" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        Name <span class="text-stone-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input type="text" id="feedback-name" name="name" value="{{ old('name') }}" maxlength="80" autocomplete="name" placeholder="Your name or pseudonym" class="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs sm:text-sm focus:border-wine focus:ring-1 focus:ring-wine outline-none transition-colors">
                    @error('name')
                        <p class="feedback-field-error text-xs text-rose-700 mt-1.5 font-medium">{{ $message }}</p>
                    @enderror
                </div>

                <div class="feedback-field">
                    <label for="feedback-subject" class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        Subject <span class="required-indicator text-wine">*</span>
                    </label>
                    <input type="text" id="feedback-subject" name="subject" value="{{ old('subject') }}" maxlength="120" required placeholder="What is your feedback about?" class="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs sm:text-sm focus:border-wine focus:ring-1 focus:ring-wine outline-none transition-colors">
                    @error('subject')
                        <p class="feedback-field-error text-xs text-rose-700 mt-1.5 font-medium">{{ $message }}</p>
                    @enderror
                </div>

                <div class="feedback-field">
                    <div class="feedback-message-label-row flex items-center justify-between mb-2">
                        <label for="feedback-message" class="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                            Message <span class="required-indicator text-wine">*</span>
                        </label>
                        <span id="feedback-message-count" class="feedback-character-count text-[11px] text-stone-400">0 / 3000</span>
                    </div>
                    <textarea id="feedback-message" name="message" rows="6" maxlength="3000" required placeholder="Write your feedback, tips, questions, or concerns here…" class="w-full px-4 py-3 rounded-lg border border-stone-300 text-xs sm:text-sm focus:border-wine focus:ring-1 focus:ring-wine outline-none transition-colors leading-relaxed">{{ old('message') }}</textarea>
                    @error('message')
                        <p class="feedback-field-error text-xs text-rose-700 mt-1.5 font-medium">{{ $message }}</p>
                    @enderror
                </div>

                <button type="submit" class="feedback-submit-button w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-wine text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-rose-950 transition-colors shadow-sm">
                    <span>Submit feedback</span>
                    <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
                </button>

                <p class="feedback-privacy-note text-xs text-stone-400 flex items-center gap-1.5 pt-2">
                    <i class="fa-solid fa-lock text-[10px]" aria-hidden="true"></i>
                    <span>Please avoid including sensitive personal credentials.</span>
                </p>
            </form>
        </div>
    </section>

    <!-- Direct Contact Methods -->
    <section class="feedback-contact-section pt-10 border-t border-stone-200" aria-labelledby="feedback-contact-title">
        <div class="feedback-contact-intro mb-6">
            <p class="feedback-eyebrow text-xs font-bold tracking-widest text-wine uppercase">DIRECT CONTACT</p>
            <h2 id="feedback-contact-title" class="font-display text-2xl font-bold text-stone-900 mt-1">
                Reach The Lens directly.
            </h2>
            <p class="text-xs text-stone-500 mt-1">You can also contact the publication through its official email or Facebook page.</p>
        </div>
        <div class="feedback-contact-methods grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a class="feedback-contact-link flex items-center justify-between p-4 rounded-xl border border-stone-200 hover:border-wine hover:shadow-sm transition-all bg-white" href="mailto:thelenspublicationpupbc@gmail.com">
                <span class="flex items-center gap-3">
                    <span class="feedback-contact-icon w-10 h-10 rounded-full bg-rose-900/10 text-wine flex items-center justify-center text-sm flex-shrink-0">
                        <i class="fa-regular fa-envelope" aria-hidden="true"></i>
                    </span>
                    <span>
                        <small class="block text-[10px] font-bold tracking-wider uppercase text-stone-400">EMAIL US</small>
                        <strong class="font-semibold text-xs text-stone-800">thelenspublicationpupbc@gmail.com</strong>
                    </span>
                </span>
                <i class="fa-solid fa-arrow-up-right-from-square text-stone-400 text-xs" aria-hidden="true"></i>
            </a>
            <a class="feedback-contact-link flex items-center justify-between p-4 rounded-xl border border-stone-200 hover:border-[#1877F2] hover:shadow-sm transition-all bg-white" href="https://www.facebook.com/profile.php?id=61560889387183" target="_blank" rel="noopener noreferrer">
                <span class="flex items-center gap-3">
                    <span class="feedback-contact-icon w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center text-sm flex-shrink-0">
                        <i class="fa-brands fa-facebook-f" aria-hidden="true"></i>
                    </span>
                    <span>
                        <small class="block text-[10px] font-bold tracking-wider uppercase text-[#1877F2]">FACEBOOK PAGE</small>
                        <strong class="font-semibold text-xs text-stone-800">The Lens Publication</strong>
                    </span>
                </span>
                <i class="fa-solid fa-arrow-up-right-from-square text-stone-400 text-xs" aria-hidden="true"></i>
            </a>
        </div>
    </section>

</main>

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function () {
        const messageInput = document.getElementById('feedback-message');
        const counter = document.getElementById('feedback-message-count');
        if (messageInput && counter) {
            function updateCount() {
                counter.textContent = messageInput.value.length + ' / 3000';
            }
            messageInput.addEventListener('input', updateCount);
            updateCount();
        }
    });
</script>
@endpush
@endsection
