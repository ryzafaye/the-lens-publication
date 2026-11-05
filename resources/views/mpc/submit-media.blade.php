@extends('layouts.mpc')

@section('title', 'Submit Media')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/executive-dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-modals.css') }}">
    <link rel="stylesheet" href="{{ asset('css/executive-manage-articles.css') }}">
    <link rel="stylesheet" href="{{ asset('css/mpc-submit-media.css') }}">
@endpush

@section('content')
<main class="content-container">

    <!-- Title Section -->
    <div class="cover-page-header-section animate-fade-in delay-1" style="margin-bottom: 24px;">
        <h1 class="cover-page-title">Submit Media</h1>
    </div>

    <div class="submit-media-container">
        
        <!-- UPLOAD PUBMAT FORM -->
        <div id="view-upload-media" class="media-view-pane">
            <form id="media-submission-form" method="POST" action="{{ route('mpc.store-media') }}" enctype="multipart/form-data">
                @csrf
                <div class="media-card">
                    <div class="media-card-header" style="margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                            <h2 class="media-card-title" style="margin-bottom: 0;">
                                <i class="fa-solid fa-palette" style="color: var(--sidebar-maroon, #5c0a18);"></i>
                                <span>Submit Publication Material</span>
                            </h2>
                        </div>
                    </div>

                    <!-- Upload Box Studio -->
                    <div class="media-section-group">
                        <!-- Dropzone -->
                        <div id="media-dropzone" class="media-dropzone-box" role="button" tabindex="0" aria-label="Upload graphic file">
                            <input type="file" name="media_file" id="media-file-input" accept="image/svg+xml,image/png,image/jpeg,image/webp" style="display: none;">
                            <div class="media-dropzone-icon">
                                <i class="fa-solid fa-cloud-arrow-up"></i>
                            </div>
                            <div class="media-dropzone-primary-text">
                                Drop your vector or raster graphic here, or <span class="media-browse-link">browse</span>
                            </div>
                            <div class="media-dropzone-subtext">
                                Supports SVG, PNG, JPG, or WEBP &bull; Max file size 10MB
                            </div>
                        </div>

                        <!-- Centered & Bounded Preview Frame -->
                        <div id="media-preview-container" class="media-preview-container" style="display: none;">
                            <div class="media-preview-wrapper">
                                <img id="media-preview-img" src="" alt="Selected Media Preview" class="media-preview-img">
                                <button type="button" id="btn-remove-preview" class="media-preview-remove-btn" title="Remove Graphic">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>

                        <!-- File Details Info Bar -->
                        <div id="media-file-info-bar" class="media-file-info-bar" style="display: none;">
                            <div class="media-file-info-left">
                                <i class="fa-solid fa-file-image media-file-icon"></i>
                                <div>
                                    <span id="media-file-name" class="media-file-name-text">filename.svg</span>
                                    <span id="media-file-size" class="media-file-size-text">• 0 KB</span>
                                </div>
                            </div>
                            <span class="media-file-ready-tag"><i class="fa-solid fa-circle-check"></i> Ready to submit</span>
                        </div>
                    </div>

                    <!-- Action Bar -->
                    <div class="media-action-footer" style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: flex-end;">
                        <button type="submit" id="btn-submit-media" class="btn-media-submit">
                            <i class="fa-solid fa-paper-plane"></i>
                            <span>Submit to Media Desk</span>
                        </button>
                    </div>

                </div>

            </form>
        </div>

    </div>

</main>
@endsection

@push('scripts')
    <script src="{{ asset('js/mpc-submit-media.js') }}"></script>
@endpush

