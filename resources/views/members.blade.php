@extends('layouts.public')

@section('title', 'Members')

@section('content')
<main class="members-page page-shell max-w-7xl mx-auto px-6 py-10">

    <!-- Sticky Go Back Toolbar -->
    <div class="members-sticky-toolbar mb-8">
        <a class="members-back-button inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-wine transition-colors" href="{{ route('public.about') }}#leadership">
            <i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Go back to About Us
        </a>
    </div>

    <!-- Hero -->
    <section class="members-page-hero mb-12 pb-6 border-b border-stone-200" aria-labelledby="members-page-title">
        <p class="text-xs font-bold tracking-widest text-wine uppercase mb-2">DIRECTORY</p>
        <h1 id="members-page-title" class="font-display text-4xl sm:text-5xl font-extrabold text-stone-900 mb-3">
            THE LENS MEMBERS
        </h1>
        <p class="text-stone-600 text-sm max-w-2xl leading-relaxed">
            Meet the officers, editors, section heads, and staffers of The Lens Publication who bring student journalism to life.
        </p>
    </section>

    <!-- Leadership Section -->
    <section class="members-list-section mb-16" aria-labelledby="leadership-list-title">
        <div class="about-section-heading mb-8">
            <p class="about-section-kicker text-xs font-bold tracking-widest text-wine uppercase">01 / LEADERSHIP</p>
            <h2 id="leadership-list-title" class="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                Officers, editors &amp; heads
            </h2>
        </div>

        @php
            $leadershipRoster = [
                ['position' => 'President', 'group' => 'Executive Board', 'name' => 'Publication President'],
                ['position' => 'Vice President', 'group' => 'Executive Board', 'name' => 'Publication Vice President'],
                ['position' => 'Secretary', 'group' => 'Executive Board', 'name' => 'Publication Secretary'],
                ['position' => 'Associate Secretary', 'group' => 'Executive Board', 'name' => 'Publication Assoc. Secretary'],
                ['position' => 'Treasurer', 'group' => 'Executive Board', 'name' => 'Publication Treasurer'],
                ['position' => 'Auditor', 'group' => 'Executive Board', 'name' => 'Publication Auditor'],
                ['position' => 'Public Relations Officer', 'group' => 'Executive Board', 'name' => 'Public Relations Officer'],
                ['position' => 'Editor-in-Chief', 'group' => 'Editorial Board', 'name' => 'Editor-in-Chief'],
                ['position' => 'Associate Editor-in-Chief', 'group' => 'Editorial Board', 'name' => 'Associate Editor-in-Chief'],
                ['position' => 'News Editor', 'group' => 'Editorial Board', 'name' => 'News Head'],
                ['position' => 'Science and Technology Editor', 'group' => 'Editorial Board', 'name' => 'SciTech Head'],
                ['position' => 'Feature Editor', 'group' => 'Editorial Board', 'name' => 'Feature Head'],
                ['position' => 'Literature Editor', 'group' => 'Editorial Board', 'name' => 'Literary Head'],
                ['position' => 'Photojournalist Head', 'group' => 'Media & Production', 'name' => 'Photojournalist Head'],
                ['position' => 'Cartoonist Head', 'group' => 'Media & Production', 'name' => 'Cartoonist Head'],
                ['position' => 'M&PC Head', 'group' => 'Media & Production', 'name' => 'Marketing & Production Head'],
                ['position' => 'Associate M&PC Head', 'group' => 'Media & Production', 'name' => 'Assoc. Marketing & Production Head'],
            ];
        @endphp

        <div id="all-leadership-grid" class="people-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            @foreach($leadershipRoster as $leader)
                <article class="member-profile-card member-profile-card-compact text-center p-3.5 rounded-xl border border-stone-100 hover:border-stone-200 hover:shadow-sm transition-all bg-white flex flex-col justify-between">
                    <div class="member-profile-photo-wrap w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 bg-stone-100 flex items-center justify-center border-2 border-stone-100">
                        <img class="member-profile-photo w-full h-full object-cover" src="{{ asset('images/member-placeholder.svg') }}" alt="{{ $leader['position'] }} profile photo" loading="lazy">
                    </div>
                    <div class="member-profile-info">
                        <p class="member-role-label text-[10px] font-bold text-wine uppercase tracking-wider line-clamp-1 mb-1">{{ $leader['position'] }}</p>
                        <h3 class="font-display font-semibold text-stone-900 text-xs">{{ $leader['name'] }}</h3>
                    </div>
                </article>
            @endforeach
        </div>
    </section>

    <!-- Staffers Section -->
    <section class="members-list-section" aria-labelledby="staff-list-title">
        <div class="about-section-heading mb-8">
            <p class="about-section-kicker text-xs font-bold tracking-widest text-wine uppercase">02 / STAFF</p>
            <h2 id="staff-list-title" class="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                Publication staffers
            </h2>
            <p class="about-section-lead text-xs sm:text-sm text-stone-600 mt-1">
                The reporters, writers, artists, photographers, and multimedia contributors who bring campus stories to life.
            </p>
        </div>

        <div id="staffer-grid" class="people-grid staffer-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            @for($i = 1; $i <= 36; $i++)
                <article class="member-profile-card member-profile-card-compact text-center p-3.5 rounded-xl border border-stone-100 hover:border-stone-200 hover:shadow-sm transition-all bg-white flex flex-col justify-between">
                    <div class="member-profile-photo-wrap w-16 h-16 mx-auto rounded-full overflow-hidden mb-3 bg-stone-100 flex items-center justify-center border-2 border-stone-100">
                        <img class="member-profile-photo w-full h-full object-cover" src="{{ asset('images/member-placeholder.svg') }}" alt="Staff member photo" loading="lazy">
                    </div>
                    <div class="member-profile-info">
                        <p class="member-role-label text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Publication Staffer</p>
                        <h3 class="font-display font-medium text-stone-800 text-xs">Staff Member {{ sprintf('%02d', $i) }}</h3>
                    </div>
                </article>
            @endfor
        </div>
    </section>

    <!-- Back to top button -->
    <div class="mt-12 text-center">
        <button type="button" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" class="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-600 hover:text-wine hover:border-wine transition-colors">
            <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
            <span>Back to top</span>
        </button>
    </div>

</main>
@endsection
