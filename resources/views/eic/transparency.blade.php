@extends('layouts.eic')

@section('title', 'Transparency')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/executive-transparency.css') }}">
@endpush

@section('content')
<main class="content-container">

    <div class="transparency-container">
        <div class="under-dev-card">
            <div class="under-dev-icon-wrap">
                <i class="fa-solid fa-hammer"></i>
            </div>

            <div class="under-dev-badge">
                <span class="under-dev-badge-dot"></span>
                <span>Under Development</span>
            </div>

            <h1 class="under-dev-title">This page is under development</h1>
        </div>
    </div>

</main>
@endsection

