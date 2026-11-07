@extends('layouts.media')

@section('title', 'Submit Media')

@section('extra-css')
    <link rel="stylesheet" href="{{ asset('css/executive-cover-review.css') }}">
    <link rel="stylesheet" href="{{ asset('css/mpc-submit-media.css') }}">
@endsection

@section('content')
<!-- Main Content Area -->
<main class="content-container">

    <!-- Title -->
    <div class="cover-page-header-section animate-fade-in delay-1" style="margin-bottom: 24px;">
        <h1 class="cover-page-title">Submit Photo</h1>
    </div>

    <div class="submit-media-container">
        
        <!-- UPLOAD PHOTO FORM -->
        <div id="view-upload-media" class="media-view-pane">
            <form id="media-submission-form" novalidate>
                @csrf
                
                <div class="media-card">
                    <div class="media-card-header" style="margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                            <h2 class="media-card-title" style="margin-bottom: 0;">
                                <i class="fa-solid fa-camera" style="color: var(--sidebar-maroon, #5c0a18);"></i>
                                <span>Submit Photo</span>
                            </h2>
                        </div>
                    </div>

                    <!-- Upload Box Studio -->
                    <div class="media-section-group">
                        <!-- Dropzone -->
                        <div id="media-dropzone" class="media-dropzone-box" role="button" tabindex="0" aria-label="Upload photo file">
                            <input type="file" id="media-file-input" accept="image/png,image/jpeg,image/webp,image/svg+xml" style="display: none;">
                            <div class="media-dropzone-icon">
                                <i class="fa-solid fa-cloud-arrow-up"></i>
                            </div>
                            <div class="media-dropzone-primary-text">
                                Drop your photo here, or <span class="media-browse-link">browse</span>
                            </div>
                            <div class="media-dropzone-subtext">
                                Supports PNG, JPG, or WEBP &bull; Max file size 10MB
                            </div>
                        </div>

                        <!-- Centered & Bounded Snug Preview Frame -->
                        <div id="media-preview-container" class="media-preview-container" style="display: none;">
                            <div class="media-preview-wrapper">
                                <img id="media-preview-img" src="" alt="Selected Media Preview" class="media-preview-img">
                                <button type="button" id="btn-remove-preview" class="media-preview-remove-btn" title="Remove Photo">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>

                        <!-- File Details Info Bar -->
                        <div id="media-file-info-bar" class="media-file-info-bar" style="display: none;">
                            <div class="media-file-info-left">
                                <i class="fa-solid fa-file-image media-file-icon"></i>
                                <div>
                                    <span id="media-file-name" class="media-file-name-text">filename.jpg</span>
                                    <span id="media-file-size" class="media-file-size-text">• 0 KB</span>
                                </div>
                            </div>
                            <span class="media-file-ready-tag" style="background: #fdf2f4; color: var(--sidebar-maroon, #5c0a18); border: 1px solid #fecdd3;">
                                <i class="fa-solid fa-circle-check" style="color: var(--sidebar-maroon, #5c0a18);"></i> Ready to submit
                            </span>
                        </div>
                    </div>

                    <!-- Action Bar: Submit Button -->
                    <div class="media-action-footer" style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: flex-end;">
                        <button type="submit" id="btn-submit-media" class="btn-media-submit">
                            <i class="fa-solid fa-paper-plane"></i>
                            <span>Submit Photo to Media Desk</span>
                        </button>
                    </div>

                </div>
            </form>
        </div>

    </div>

</main>
@endsection

@section('extra-js')
<script>
    window.MEDIA_MANAGE_ROUTE = "{{ route('media.manage-media') }}";
</script>
<script src="{{ asset('js/media-data.js') }}"></script>
<script src="{{ asset('js/media-submit-media.js') }}"></script>
@endsection

