@extends('layouts.cartoonist')

@section('title', 'Submit Cartoon')

@section('extra-css')
    <link rel="stylesheet" href="{{ asset('css/mpc-submit-media.css') }}">
@endsection

@section('content')
<!-- Main Content Area -->
<main class="content-container">

    <!-- Title -->
    <div class="page-title-section animate-fade-in delay-1" style="margin-bottom: 24px;">
        <div class="page-header-row">
            <h1 class="page-title">Submit Cartoon</h1>
        </div>
    </div>

    @if(session('success'))
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-circle-check" style="font-size: 1.1rem;"></i>
            <span>{{ session('success') }}</span>
        </div>
    @endif

    <div class="submit-media-container">
        
        <!-- UPLOAD CARTOON FORM -->
        <div id="view-upload-media" class="media-view-pane">
            <form id="cartoon-submission-form" method="POST" action="{{ route('cartoonist.store-cartoon') }}" enctype="multipart/form-data" novalidate>
                @csrf
                <div class="media-card">
                    <div class="media-card-header" style="margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                            <h2 class="media-card-title" style="margin-bottom: 0;">
                                <i class="fa-solid fa-paintbrush" style="color: var(--sidebar-maroon, #5c0a18);"></i>
                                <span>Submit Editorial Cartoon</span>
                            </h2>
                        </div>
                    </div>

                    <!-- Upload Box Studio -->
                    <div class="media-section-group">
                        <!-- Dropzone -->
                        <div id="cartoon-dropzone" class="media-dropzone-box" role="button" tabindex="0" aria-label="Upload cartoon illustration">
                            <input type="file" id="cartoon-file-input" name="cartoon_file" accept="image/svg+xml,image/png,image/jpeg,image/webp" style="display: none;">
                            <div class="media-dropzone-icon">
                                <i class="fa-solid fa-cloud-arrow-up"></i>
                            </div>
                            <div class="media-dropzone-primary-text">
                                Drop your cartoon illustration here, or <span class="media-browse-link">browse</span>
                            </div>
                            <div class="media-dropzone-subtext">
                                Supports SVG, PNG, JPG, or WEBP &bull; Max file size 10MB
                            </div>
                        </div>

                        <!-- Centered & Bounded Snug Preview Frame -->
                        <div id="cartoon-preview-container" class="media-preview-container" style="display: none;">
                            <div class="media-preview-wrapper">
                                <img id="cartoon-preview-img" src="" alt="Selected Cartoon Preview" class="media-preview-img">
                                <button type="button" id="btn-remove-preview" class="media-preview-remove-btn" title="Remove Graphic">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>

                        <!-- File Details Info Bar -->
                        <div id="cartoon-file-info-bar" class="media-file-info-bar" style="display: none;">
                            <div class="media-file-info-left">
                                <i class="fa-solid fa-file-image media-file-icon"></i>
                                <div>
                                    <span id="cartoon-file-name" class="media-file-name-text">filename.svg</span>
                                    <span id="cartoon-file-size" class="media-file-size-text">• 0 KB</span>
                                </div>
                            </div>
                            <span class="media-file-ready-tag"><i class="fa-solid fa-circle-check"></i> Ready to submit</span>
                        </div>
                    </div>

                    <!-- Action Bar: Just the Submit Button -->
                    <div class="media-action-footer" style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: flex-end;">
                        <button type="submit" id="btn-submit-cartoon" class="btn-media-submit">
                            <i class="fa-solid fa-paper-plane"></i>
                            <span>Submit Cartoon to Desk</span>
                        </button>
                    </div>

                </div>
            </form>
        </div>

    </div>

</main>

<!-- Toast Notifications Container -->
<div id="toast-container" class="toast-container"></div>
@endsection

@section('extra-js')
<script src="{{ asset('js/cartoonist-submit-cartoon.js') }}"></script>
@endsection

