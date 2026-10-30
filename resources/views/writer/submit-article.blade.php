@extends('layouts.writer')

@section('title', 'Submit Article')

@section('extra-css')
    <link rel="stylesheet" href="{{ asset('css/submit-article.css') }}">
@endsection

@section('content')
<main class="content-container">
    <div class="page-title-section">
        <div class="page-header-row">
            <h1 class="page-title">Submit Article</h1>
        </div>
    </div>

    @if(session('success'))
        <script>
            window.__SESSION_SUCCESS__ = @json(session('success'));
        </script>
    @endif

    @if(session('error'))
        <script>
            window.__SESSION_ERROR__ = @json(session('error'));
        </script>
    @endif

    @php
        $activeTab = request('tab', 'write');
    @endphp

    <div class="submit-tabs-nav" role="tablist" aria-label="Article Views">
        <button type="button" class="submit-tab-btn {{ $activeTab === 'write' ? 'active' : '' }}" data-tab="write" id="tab-write-btn" role="tab" aria-selected="{{ $activeTab === 'write' ? 'true' : 'false' }}" aria-controls="write-view">
            <i class="fa-solid fa-pen-to-square"></i><span>Write Article</span>
        </button>
        <button type="button" class="submit-tab-btn {{ $activeTab === 'drafts' ? 'active' : '' }}" data-tab="drafts" id="tab-drafts-btn" role="tab" aria-selected="{{ $activeTab === 'drafts' ? 'true' : 'false' }}" aria-controls="drafts-view">
            <i class="fa-regular fa-folder-open"></i><span>Drafts</span>
            <span class="drafts-tab-badge" id="drafts-count-badge">{{ count($drafts) }}</span>
        </button>
    </div>

    <!-- Laravel Submission Form -->
    <form id="laravel-article-form" method="POST" action="{{ route('writer.store-article') }}">
        @csrf
        <input type="hidden" name="article_id" id="hidden-article-id" value="{{ old('article_id', isset($editingDraft) ? $editingDraft->id : '') }}">
        <input type="hidden" name="content" id="hidden-content" value="{{ old('content') }}">
        <input type="hidden" name="status" id="hidden-status" value="Pending Review">

        @if ($errors->any())
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <strong style="display: block; margin-bottom: 8px;"><i class="fa-solid fa-triangle-exclamation"></i> Action Failed: Please resolve the following issues:</strong>
                <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem;">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="write-view view-container {{ $activeTab === 'drafts' ? 'hidden' : '' }}" id="write-view" role="tabpanel" aria-labelledby="tab-write-btn">
            <div class="writing-canvas-container">

                <div class="headline-box-wrapper" id="headline-box-wrapper">
                    <textarea id="article-headline" name="title" class="headline-input" rows="1" placeholder="Write your headline here..." maxlength="255" required>{{ old('title', isset($editingDraft) ? $editingDraft->title : '') }}</textarea>
                    <div class="headline-helper-row">
                        <span></span>
                        <span id="headline-char-count" class="headline-char-count">0 / 255</span>
                    </div>
                </div>

                <div class="meta-controls-row">
                    <div class="category-select-wrapper">
                        <label for="article-category" class="category-label"><i class="fa-solid fa-tag"></i><span>Section:</span></label>
                        <div class="select-styled-container" id="category-select-container">
                            <select id="article-category" name="category_id" class="category-dropdown-select" required>
                                <option value="" disabled {{ (old('category_id') === null && !isset($editingDraft)) ? 'selected' : '' }}>Select category...</option>
                                @foreach($categories as $category)
                                    <option value="{{ $category->id }}" {{ (old('category_id', isset($editingDraft) ? $editingDraft->category_id : '') == $category->id) ? 'selected' : '' }}>{{ $category->name }}</option>
                                @endforeach
                            </select>
                            <i class="fa-solid fa-chevron-down select-chevron"></i>
                        </div>
                    </div>
                    <div class="author-byline-display">
                        <i class="fa-solid fa-pen-nib"></i><span>By <strong>{{ Auth::user()->full_name }}</strong></span>
                    </div>
                </div>

                <div class="excerpt-box-wrapper" id="excerpt-box-wrapper">
                    <label for="article-excerpt" class="excerpt-label"><i class="fa-solid fa-align-left"></i><span>Excerpt</span></label>
                    <textarea id="article-excerpt" name="excerpt" class="excerpt-input" rows="2" maxlength="255" placeholder="Write a brief excerpt or teaser..." required>{{ old('excerpt', isset($editingDraft) ? $editingDraft->excerpt : '') }}</textarea>
                    <div class="excerpt-helper-row">
                        <span></span>
                        <span id="excerpt-char-count" class="excerpt-char-count">0 / 255</span>
                    </div>
                </div>

                <!-- Formatting Toolbar -->
                <div class="editor-toolbar" id="editor-toolbar" role="toolbar">
                    <button type="button" class="tool-btn" data-command="bold" title="Bold (Ctrl+B)"><i class="fa-solid fa-bold"></i></button>
                    <button type="button" class="tool-btn" data-command="italic" title="Italic (Ctrl+I)"><i class="fa-solid fa-italic"></i></button>
                    <button type="button" class="tool-btn" data-command="underline" title="Underline (Ctrl+U)"><i class="fa-solid fa-underline"></i></button>
                    <div class="toolbar-divider"></div>
                    <button type="button" class="tool-btn" data-command="formatBlock" data-value="<h2>"><span>H2</span></button>
                    <button type="button" class="tool-btn" data-command="formatBlock" data-value="<h3>"><span>H3</span></button>
                    <button type="button" class="tool-btn" data-command="formatBlock" data-value="<blockquote>"><i class="fa-solid fa-quote-left"></i></button>
                    <div class="toolbar-divider"></div>
                    <button type="button" class="tool-btn" data-command="insertUnorderedList" title="Bullet List"><i class="fa-solid fa-list-ul"></i></button>
                    <button type="button" class="tool-btn" data-command="insertOrderedList" title="Numbered List"><i class="fa-solid fa-list-ol"></i></button>
                </div>

                <div class="editor-body-wrapper" id="editor-body-wrapper">
                    <div id="editor-content" class="rich-editor-content" contenteditable="true" spellcheck="true" data-placeholder="Write your article here..."></div>
                </div>

                <div class="editor-footer-bar">
                    <div class="editor-metrics-left">
                        <span class="metric-pill"><i class="fa-solid fa-font"></i><span id="words-count">0 words</span></span>
                    </div>
                    <div class="editor-actions-right">
                        <button type="button" id="btn-save-draft" class="btn-secondary-action"><i class="fa-regular fa-floppy-disk"></i><span>Save Draft</span></button>
                        <button type="button" id="btn-submit-article" class="btn-submit-primary"><i class="fa-solid fa-paper-plane"></i><span>Submit Article</span></button>
                    </div>
                </div>

            </div>
        </div>
    </form>

    <!-- View 2: Drafts View Container (.drafts-view - Review-Articles Layout) -->
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
                                <span class="draft-box-category">{{ $draft->category->name ?? 'Uncategorized' }}</span>
                                <span class="draft-box-date"><i class="fa-regular fa-calendar" aria-hidden="true"></i> Saved {{ $draft->created_at->format('M d, Y') }}</span>
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
</main>

<!-- Hidden form for deleting drafts safely via Laravel DELETE route -->
<form id="delete-draft-form" method="POST" style="display: none;">
    @csrf
    @method('DELETE')
</form>

<!-- Toast Container -->
<div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="true"></div>

@if(isset($editingDraft))
    @php
        $draftData = [
            'id' => $editingDraft->id,
            'title' => $editingDraft->title,
            'category_id' => $editingDraft->category_id,
            'excerpt' => $editingDraft->excerpt,
            'content' => $editingDraft->content,
        ];
    @endphp

    <script>
        window.__INITIAL_EDITING_DRAFT__ = @json($draftData);
    </script>
@endif
@endsection

@section('extra-js')
    <script src="{{ asset('js/writer-submit-article.js') }}"></script>
@endsection
