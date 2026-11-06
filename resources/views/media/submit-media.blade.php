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
        <h1 class="cover-page-title">Submit Media</h1>
    </div>

    <div class="submit-media-container">
        
        <!-- UPLOAD PUBMAT FORM -->
        <div id="view-upload-media" class="media-view-pane">
            <form id="media-submission-form" novalidate>
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

                    <!-- Media Type Segmented Selector -->
                    <div class="media-type-selector" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                        <div class="media-type-card selected" data-type="pubmat" role="button" tabindex="0">
                            <i class="fa-solid fa-palette"></i>
                            <span>Publication Material (PUBMAT)</span>
                            <small>Digital artworks, graphics, posters & announcements</small>
                        </div>
                        <div class="media-type-card" data-type="photo" role="button" tabindex="0">
                            <i class="fa-solid fa-camera"></i>
                            <span>Photojournalism (Photo)</span>
                            <small>Event captures, photo stories & campus photography</small>
                        </div>
                    </div>
                    <input type="hidden" id="selected-media-type" name="media_type" value="pubmat">

                    <!-- Upload Box Studio -->
                    <div class="media-section-group">
                        <!-- Dropzone -->
                        <div id="media-dropzone" class="media-dropzone-box" role="button" tabindex="0" aria-label="Upload graphic file">
                            <input type="file" id="media-file-input" accept="image/svg+xml,image/png,image/jpeg,image/webp" style="display: none;">
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

                        <!-- Centered & Bounded Snug Preview Frame -->
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

                    <!-- Action Bar: Submit Button -->
                    <div class="media-action-footer" style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: flex-end;">
                        <button type="submit" id="btn-submit-media" class="btn-media-submit">
                            <i class="fa-solid fa-paper-plane"></i>
                            <span>Submit Media to Desk</span>
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

