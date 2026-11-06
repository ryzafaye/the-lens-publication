@extends('layouts.executive')

@section('title', 'Manage Accounts')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/executive-manage-accounts.css') }}">
@endpush

@section('content')
<main class="content-container">

    <div class="accounts-container">

        <!-- Header Row: Title & Active Stats Summary -->
        <div class="accounts-header-row">
            <h1 class="accounts-page-title">Manage Accounts</h1>
            <div id="accounts-stats-indicator" class="accounts-stats-indicator">
                <!-- Populated by JS -->
            </div>
        </div>

        <!-- Controls Bar: Search Box + Status Filter + Add Officer Button -->
        <div class="accounts-controls-bar">
            <div class="accounts-controls-left">
                
                <!-- Search Box Input -->
                <div class="accounts-search-wrapper">
                    <i class="fa-solid fa-magnifying-glass accounts-search-icon" aria-hidden="true"></i>
                    <input 
                        type="text" 
                        id="officer-search-input" 
                        class="accounts-search-input" 
                        placeholder="Search officers by name, student number, or role..."
                        aria-label="Search officers">
                    <button type="button" id="officer-search-clear" class="accounts-search-clear" aria-label="Clear search">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <!-- Status Filter Dropdown -->
                <div class="status-filter-wrapper">
                    <select id="status-filter-select" class="status-filter-select" aria-label="Filter by account status">
                        <option value="all">All Accounts</option>
                        <option value="active">Active Only</option>
                        <option value="deactivated">Deactivated Only</option>
                    </select>
                    <i class="fa-solid fa-chevron-down status-filter-chevron" aria-hidden="true"></i>
                </div>

            </div>

            <!-- Add Officer Primary Button -->
            <button type="button" id="btn-open-add-modal" class="btn-add-officer" title="Add a new officer account">
                <i class="fa-solid fa-user-plus" aria-hidden="true"></i>
                <span>Add Officer</span>
            </button>
        </div>

        <!-- Accounts Dynamic List Container -->
        <div id="accounts-list-container" class="accounts-list-container" aria-live="polite">
            <!-- Dynamic Officer Box Cards Rendered by executive-manage-accounts.js -->
        </div>

    </div>

</main>

<!-- ====================================================================== -->
<!-- MODAL 1: ADD OFFICER ACCOUNT MODAL (Student No. BN-0, Name, Role Only) -->
<!-- ====================================================================== -->
<div id="add-officer-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="add-modal-title">
    <div class="modal-card edit-modal-card">
        
        <div class="modal-header-simple">
            <h3 id="add-modal-title" class="modal-title font-semibold text-base">
                <i class="fa-solid fa-user-plus text-[#5c0a18]"></i>
                <span>Add New Officer Account</span>
            </h3>
            <button type="button" id="btn-close-add-modal" class="viewer-close-btn" aria-label="Close dialog">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <form id="add-officer-form" class="edit-modal-form" novalidate>
            @csrf
            <div class="form-field">
                <label for="officer-input-student-id">Student Number *</label>
                <input 
                    type="text" 
                    id="officer-input-student-id" 
                    class="form-input" 
                    placeholder="e.g. 2023-00123-BN-0" 
                    required>
            </div>

            <div class="form-field">
                <label for="officer-input-name">Full Name *</label>
                <input 
                    type="text" 
                    id="officer-input-name" 
                    class="form-input" 
                    placeholder="e.g. Maria Clara Santos" 
                    required>
            </div>

            <div class="form-field">
                <label for="officer-input-role">Role *</label>
                <select id="officer-input-role" class="form-select" required>
                    <option value="" disabled selected>Select role...</option>
                    @foreach($roles ?? [] as $role)
                        <option value="{{ $role->role_name }}" data-id="{{ $role->id }}">{{ $role->role_name }}</option>
                    @endforeach
                    @if(empty($roles) || count($roles) === 0)
                        <option value="President">President</option>
                        <option value="Executive Vice President">Executive Vice President</option>
                        <option value="Secretary">Secretary</option>
                        <option value="Associate Secretary">Associate Secretary</option>
                        <option value="Treasurer">Treasurer</option>
                        <option value="Auditor">Auditor</option>
                        <option value="Public Relations Officer">Public Relations Officer</option>
                        <option value="Editor-in-Chief">Editor-in-Chief</option>
                        <option value="Associate Editor-in-Chief">Associate Editor-in-Chief</option>
                        <option value="News Head">News Head</option>
                        <option value="Literary Head">Literary Head</option>
                        <option value="Feature Head">Feature Head</option>
                        <option value="Science and Technology Head">Science and Technology Head</option>
                        <option value="Documentary and Podcast Head">Documentary and Podcast Head</option>
                        <option value="Media and Public Communications Head">Media and Public Communications Head</option>
                        <option value="Associate Media and Public Communications Head">Associate Media and Public Communications Head</option>
                        <option value="Photojournalist Head">Photojournalist Head</option>
                        <option value="Cartoonist Head">Cartoonist Head</option>
                        <option value="Writer">Writer</option>
                        <option value="Cartoonist">Cartoonist</option>
                        <option value="Media Team">Media Team</option>
                    @endif
                </select>
            </div>

            <!-- Footer with Maroon Designed Create Account Button -->
            <div class="modal-single-btn-footer">
                <button type="submit" class="btn-modal-submit-maroon">
                    <i class="fa-solid fa-user-plus"></i>
                    <span>Create Account</span>
                </button>
            </div>

        </form>

    </div>
</div>

<!-- ====================================================================== -->
<!-- MODAL 2: DEACTIVATION CONFIRMATION DIALOG                             -->
<!-- ====================================================================== -->
<div id="deactivate-confirm-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="deactivate-dialog-title">
    <div class="modal-card">
        
        <div class="modal-header-simple">
            <h3 id="deactivate-dialog-title" class="modal-title font-semibold text-base text-rose-700">
                <i class="fa-solid fa-triangle-exclamation text-rose-600"></i>
                <span>Confirm Account Deactivation</span>
            </h3>
            <button type="button" id="btn-close-deactivate" class="viewer-close-btn" aria-label="Close dialog">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="modal-confirm-body">
            <p>
                Are you sure you want to deactivate <strong id="deactivate-officer-name" class="officer-target-highlight">this officer</strong>?
            </p>
            <p class="text-xs text-stone-500">
                The officer's administrative credentials will be temporarily suspended. You can reactivate their account at any time.
            </p>
        </div>

        <!-- Modal Footer -->
        <div class="modal-confirm-footer">
            <button type="button" id="btn-confirm-deactivate" class="btn-modal-submit-deactivate">
                <i class="fa-solid fa-user-slash"></i>
                <span>Deactivate Account</span>
            </button>
        </div>

    </div>
</div>

<!-- ====================================================================== -->
<!-- MODAL 3: EDIT OFFICER ROLE MODAL                                      -->
<!-- ====================================================================== -->
<div id="edit-role-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="edit-role-modal-title">
    <div class="modal-card edit-modal-card">
        
        <div class="modal-header-simple">
            <h3 id="edit-role-modal-title" class="modal-title font-semibold text-base">
                <i class="fa-solid fa-user-pen text-[#5c0a18]"></i>
                <span>Edit Officer Role</span>
            </h3>
            <button type="button" id="btn-close-edit-role-modal" class="viewer-close-btn" aria-label="Close dialog">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <form id="edit-role-form" class="edit-modal-form" novalidate>
            @csrf
            <!-- Target Officer Banner -->
            <div class="edit-role-officer-banner">
                <div class="edit-role-avatar-wrap">
                    <img id="edit-role-avatar" src="{{ asset('images/member-placeholder.svg') }}" alt="Officer Avatar" class="edit-role-avatar-img">
                </div>
                <div class="edit-role-officer-info">
                    <div id="edit-role-officer-name" class="edit-role-name">Officer Name</div>
                    <div id="edit-role-current-badge" class="edit-role-current">Current Role: <strong>Role</strong></div>
                </div>
            </div>

            <div class="form-field">
                <label for="edit-role-select">Select New Role *</label>
                <select id="edit-role-select" class="form-select" required>
                    <option value="" disabled>Select role...</option>
                    @foreach($roles ?? [] as $role)
                        <option value="{{ $role->role_name }}" data-id="{{ $role->id }}">{{ $role->role_name }}</option>
                    @endforeach
                    @if(empty($roles) || count($roles) === 0)
                        <option value="President">President</option>
                        <option value="Executive Vice President">Executive Vice President</option>
                        <option value="Secretary">Secretary</option>
                        <option value="Associate Secretary">Associate Secretary</option>
                        <option value="Treasurer">Treasurer</option>
                        <option value="Auditor">Auditor</option>
                        <option value="Public Relations Officer">Public Relations Officer</option>
                        <option value="Editor-in-Chief">Editor-in-Chief</option>
                        <option value="Associate Editor-in-Chief">Associate Editor-in-Chief</option>
                        <option value="News Head">News Head</option>
                        <option value="Literary Head">Literary Head</option>
                        <option value="Feature Head">Feature Head</option>
                        <option value="Science and Technology Head">Science and Technology Head</option>
                        <option value="Documentary and Podcast Head">Documentary and Podcast Head</option>
                        <option value="Media and Public Communications Head">Media and Public Communications Head</option>
                        <option value="Associate Media and Public Communications Head">Associate Media and Public Communications Head</option>
                        <option value="Photojournalist Head">Photojournalist Head</option>
                        <option value="Cartoonist Head">Cartoonist Head</option>
                        <option value="Writer">Writer</option>
                        <option value="Cartoonist">Cartoonist</option>
                        <option value="Media Team">Media Team</option>
                    @endif
                </select>
            </div>

            <!-- Modal Footer -->
            <div class="modal-single-btn-footer">
                <button type="submit" class="btn-modal-submit-maroon">
                    <i class="fa-solid fa-check"></i>
                    <span>Update Role</span>
                </button>
            </div>

        </form>

    </div>
</div>

<!-- Toast Notification Container -->
<div id="toast-container" class="toast-container" aria-live="polite"></div>
@endsection

@push('scripts')
    <script>
        window.INITIAL_OFFICERS = @json($formattedOfficers ?? []);
        window.INITIAL_DATA = @json($formattedOfficers ?? []);
        window.OFFICER_DATA = @json($formattedOfficers ?? []);
        window.AVAILABLE_ROLES = @json($roles ?? []);
        window.ROLES_DATA = @json($roles ?? []);
        window.MANAGE_ACCOUNTS_STORE_URL = @json(route('executive.manage-accounts.store'));
        window.__ACCOUNT_ROUTES__ = {
            base: "{{ route('executive.manage-accounts') }}",
            store: "{{ route('executive.manage-accounts.store') }}",
            updateRole: "{{ route('executive.manage-accounts') }}",
            toggleStatus: "{{ route('executive.manage-accounts') }}"
        };
    </script>
    <script src="{{ asset('js/executive-manage-accounts.js') }}"></script>
@endpush

