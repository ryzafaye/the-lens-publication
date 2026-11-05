@extends('layouts.cartoonist')

@section('title', 'Submit Article')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/executive-submit-article.css') }}">
    <link rel="stylesheet" href="{{ asset('css/shared-submit-article.css') }}">
@endpush

@section('content')
<main class="content-container">
    <div class="submit-article-container">

        <!-- Top Section: Header with Title -->
        <div class="page-title-section">
            <div class="page-header-row">
                <h1 class="page-title">Submit Article</h1>
            </div>
        </div>

        @if(session('success'))
            <script>
                window.__SESSION_SUCCESS__ = @json(session('success'));
            </script>
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-circle-check" style="font-size: 1.1rem;"></i>
                <span>{{ session('success') }}</span>
            </div>
        @endif

        @if(session('error'))
            <script>
                window.__SESSION_ERROR__ = @json(session('error'));
            </script>
        @endif

        @if (isset($errors) && $errors->any())
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <strong style="display: block; margin-bottom: 8px;"><i class="fa-solid fa-triangle-exclamation"></i> Action Failed: Please resolve the following issues:</strong>
                <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem;">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        @php
            $activeTab = request('tab', 'write');
        @endphp

        <!-- Tab Navigation: Write Article & Drafts (Executive Parity) -->
        <div class="submit-tabs-nav" role="tablist" aria-label="Article Views">
            <button type="button" class="submit-tab-btn {{ $activeTab === 'write' ? 'active' : '' }}" data-tab="write" id="tab-write-btn" role="tab" aria-selected="{{ $activeTab === 'write' ? 'true' : 'false' }}" aria-controls="write-view">
                <i class="fa-solid fa-pen-to-square"></i>
                <span>Write Article</span>
            </button>
            <button type="button" class="submit-tab-btn {{ $activeTab === 'drafts' ? 'active' : '' }}" data-tab="drafts" id="tab-drafts-btn" role="tab" aria-selected="{{ $activeTab === 'drafts' ? 'true' : 'false' }}" aria-controls="drafts-view">
                <i class="fa-regular fa-folder-open"></i>
                <span>Drafts</span>
                <span id="drafts-count-badge" class="drafts-tab-badge">{{ isset($drafts) ? count($drafts) : 0 }}</span>
            </button>
        </div>

        <!-- Laravel Form Shell -->
        <form id="laravel-article-form" method="POST" action="{{ route('cartoonist.store-article') }}">
            @csrf
            <input type="hidden" name="article_id" id="hidden-article-id" value="{{ old('article_id', isset($editingDraft) ? $editingDraft->id : '') }}">
            <input type="hidden" name="content" id="hidden-content" value="{{ old('content', isset($editingDraft) ? $editingDraft->content : '') }}">
            <input type="hidden" name="status" id="hidden-status" value="Pending Review">

            <!-- View 1: Write Article View (.write-view) -->
            <div class="write-view view-container {{ $activeTab === 'drafts' ? 'hidden' : '' }}" id="write-view" role="tabpanel" aria-labelledby="tab-write-btn">
                
                <!-- Ultra-Minimalist Distraction-Free Writing Canvas (Notion / Medium Style) -->
                <div class="writing-canvas-container">

                    <!-- 1. Big Box Headline Input (255 Max Characters, Continuous Sentence Enforced) -->
                    <div class="headline-box-wrapper" id="headline-box-wrapper">
                        <textarea 
                            id="article-headline" 
                            name="title"
                            class="headline-input" 
                            rows="1" 
                            placeholder="Write your headline here..." 
                            maxlength="255"
                            aria-label="Article Headline"
                            required>{{ old('title', isset($editingDraft) ? $editingDraft->title : '') }}</textarea>
                        
                        <div class="headline-helper-row">
                            <span></span>
                            <span id="headline-char-count" class="headline-char-count">0 / 255</span>
                        </div>
                    </div>

                    <!-- 2. Section Dropdown & Author Byline -->
                    <div class="meta-controls-row">
                        <div class="category-select-wrapper">
                            <label for="article-category" class="category-label">
                                <i class="fa-solid fa-tag"></i>
                                <span>Section:</span>
                            </label>
                            <div class="select-styled-container" id="category-select-container">
                                <select id="article-category" name="category_id" class="category-dropdown-select" aria-label="Select section category" required>
                                    <option value="" disabled {{ !old('category_id', isset($editingDraft) ? $editingDraft->category_id : null) ? 'selected' : '' }}>Select category...</option>
                                    @if(isset($categories) && count($categories) > 0)
                                        @foreach($categories as $category)
                                            <option value="{{ $category->id }}" {{ old('category_id', isset($editingDraft) ? $editingDraft->category_id : null) == $category->id ? 'selected' : '' }}>
                                                {{ $category->name }}
                                            </option>
                                        @endforeach
                                    @else
                                        <option value="1">News</option>
                                        <option value="2">Literature</option>
                                        <option value="3">Feature</option>
                                        <option value="4">Science &amp; Technology</option>
                                        <option value="5">Opinion</option>
                                    @endif
                                </select>
                                <i class="fa-solid fa-chevron-down select-chevron" aria-hidden="true"></i>
                            </div>
                        </div>

                        <!-- Author with Pen Nib Icon -->
                        <div class="author-byline-display">
                            <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
                            <span>By <strong id="author-name-display">{{ Auth::user()->full_name }}</strong></span>
                        </div>
                    </div>

                    <!-- 3. Excerpt Field (255 Max Characters) -->
                    <div class="excerpt-box-wrapper" id="excerpt-box-wrapper">
                        <label for="article-excerpt" class="excerpt-label">
                            <i class="fa-solid fa-align-left"></i>
                            <span>Excerpt</span>
                        </label>
                        <textarea 
                            id="article-excerpt" 
                            name="excerpt"
                            class="excerpt-input" 
                            rows="2" 
                            maxlength="255"
                            placeholder="Write a brief excerpt or teaser summarizing the article..."
                            aria-label="Article Excerpt"
                            required>{{ old('excerpt', isset($editingDraft) ? $editingDraft->excerpt : '') }}</textarea>
                        <div class="excerpt-helper-row">
                            <span></span>
                            <span id="excerpt-char-count" class="excerpt-char-count">0 / 255</span>
                        </div>
                    </div>

                    <!-- 4. Notion / Medium Rich Text Formatting Toolbar -->
                    <div class="editor-toolbar" id="editor-toolbar" role="toolbar" aria-label="Text Formatting Toolbar">
                        <button type="button" class="tool-btn" data-command="bold" title="Bold (Ctrl+B)">
                            <i class="fa-solid fa-bold"></i>
                        </button>
                        <button type="button" class="tool-btn" data-command="italic" title="Italic (Ctrl+I)">
                            <i class="fa-solid fa-italic"></i>
                        </button>
                        <button type="button" class="tool-btn" data-command="underline" title="Underline (Ctrl+U)">
                            <i class="fa-solid fa-underline"></i>
                        </button>
                        <button type="button" class="tool-btn" data-command="strikeThrough" title="Strikethrough">
                            <i class="fa-solid fa-strikethrough"></i>
                        </button>

                        <div class="toolbar-divider"></div>

                        <button type="button" class="tool-btn" data-command="formatBlock" data-value="<h2>" title="Large Heading (H2)">
                            <span>H2</span>
                        </button>
                        <button type="button" class="tool-btn" data-command="formatBlock" data-value="<h3>" title="Small Heading (H3)">
                            <span>H3</span>
                        </button>
                        <button type="button" class="tool-btn" data-command="formatBlock" data-value="<blockquote>" title="Blockquote">
                            <i class="fa-solid fa-quote-left"></i>
                        </button>

                        <div class="toolbar-divider"></div>

                        <button type="button" class="tool-btn" data-command="insertUnorderedList" title="Bulleted List">
                            <i class="fa-solid fa-list-ul"></i>
                        </button>
                        <button type="button" class="tool-btn" data-command="insertOrderedList" title="Numbered List">
                            <i class="fa-solid fa-list-ol"></i>
                        </button>

                        <div class="toolbar-divider"></div>

                        <button type="button" class="tool-btn" data-command="createLink" title="Insert Link">
                            <i class="fa-solid fa-link"></i>
                        </button>
                        <button type="button" class="tool-btn" data-command="insertHorizontalRule" title="Horizontal Divider">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <button type="button" class="tool-btn" data-command="removeFormat" title="Clear Formatting">
                            <i class="fa-solid fa-text-slash"></i>
                        </button>
                    </div>

                    <!-- 5. Rich Text Editor Body -->
                    <div class="editor-body-wrapper" id="editor-body-wrapper">
                        <div 
                            id="editor-content" 
                            class="rich-editor-content" 
                            contenteditable="true" 
                            spellcheck="true" 
                            role="textbox"
                            aria-multiline="true"
                            data-placeholder="Write your article here...">{!! old('content', isset($editingDraft) ? $editingDraft->content : '') !!}</div>
                    </div>

                    <!-- 6. Footer Action Bar & Real-Time Metrics -->
                    <div class="editor-footer-bar">
                        <div class="editor-metrics-left">
                            <span class="metric-pill" title="Word count">
                                <i class="fa-solid fa-font"></i>
                                <span id="words-count">0 words</span>
                            </span>
                            <span class="metric-pill" title="Character count">
                                <i class="fa-regular fa-keyboard"></i>
                                <span id="chars-count">0 characters</span>
                            </span>
                        </div>

                        <div class="editor-actions-right">
                            <button type="button" id="btn-save-draft" class="btn-secondary-action" title="Save draft locally">
                                <i class="fa-regular fa-floppy-disk"></i>
                                <span>Save Draft</span>
                            </button>

                            <button type="button" id="btn-submit-article" class="btn-submit-primary" title="Submit article to editorial review queue">
                                <i class="fa-solid fa-paper-plane"></i>
                                <span>Submit Article</span>
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </form>

        <!-- View 2: Drafts View Container (.drafts-view - Executive Parity Layout) -->
        <div class="drafts-view view-container {{ $activeTab === 'drafts' ? '' : 'hidden' }}" id="drafts-view" role="tabpanel" aria-labelledby="tab-drafts-btn">
            <div class="drafts-view-container">
                
                <!-- Dynamic Responsive Horizontal List Card Container -->
                <div class="drafts-list-container" id="drafts-list-container">
                    @forelse($drafts as $draft)
                        <div class="draft-box" id="draft-box-{{ $draft->id }}" data-id="{{ $draft->id }}" data-draft="{{ json_encode([
                            'id' => $draft->id,
                            'title' => $draft->title,
                            'category_id' => $draft->category_id,
                            'excerpt' => $draft->excerpt,
                            'content' => $draft->content
                        ]) }}">
                            <div class="draft-box-content">
                                <div class="draft-box-meta">
                                    <span class="draft-box-category">{{ $draft->category->name ?? 'Opinion' }}</span>
                                    <span class="draft-box-date"><i class="fa-regular fa-calendar" aria-hidden="true"></i> Saved {{ $draft->created_at ? $draft->created_at->format('M d, Y') : ($draft->updated_at ? $draft->updated_at->format('M d, Y') : date('M d, Y')) }}</span>
                                </div>
                                <button type="button" class="draft-box-title" data-action="edit" data-id="{{ $draft->id }}" title="{{ $draft->title }}">{{ $draft->title }}</button>
                                @if($draft->excerpt)
                                    <p class="draft-box-excerpt">{{ $draft->excerpt }}</p>
                                @endif
                            </div>
                            <div class="draft-box-actions">
                                <button type="button" class="btn-draft-edit" data-action="edit" data-id="{{ $draft->id }}" title="Edit this draft">
                                    <i class="fa-solid fa-pen"></i><span>Edit Draft</span>
                                </button>
                                <button type="button" class="btn-draft-delete" data-action="delete" data-id="{{ $draft->id }}" title="Delete draft">
                                    <i class="fa-regular fa-trash-can"></i><span>Delete</span>
                                </button>
                            </div>
                        </div>
                    @empty
                        <div id="empty-drafts-state" class="empty-drafts-box">
                            <i class="fa-regular fa-folder-open"></i>
                            <h3 class="empty-drafts-title">No Drafts Saved</h3>
                            <p class="empty-drafts-subtitle">Any articles you save as drafts will appear here for easy editing.</p>
                        </div>
                    @endforelse
                </div>

            </div>
        </div>

    </div>
</main>

<!-- Hidden form for deleting drafts safely via Laravel DELETE route -->
<form id="delete-draft-form" method="POST" style="display: none;">
    @csrf
    @method('DELETE')
</form>

<!-- Clean Success Notification Toast Container -->
<div id="toast-container" class="toast-container" aria-live="polite"></div>
@endsection

@section('extra-js')
@if(isset($editingDraft))
    <script>
        window.__INITIAL_EDITING_DRAFT__ = {!! json_encode([
            'id' => $editingDraft->id,
            'title' => $editingDraft->title,
            'category_id' => $editingDraft->category_id,
            'excerpt' => $editingDraft->excerpt,
            'content' => $editingDraft->content,
        ]) !!};
    </script>
@endif
<script src="{{ asset('js/shared-submit-article.js') }}"></script>
@endsection
