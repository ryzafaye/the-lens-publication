@extends(request()->is('executive*') ? 'layouts.executive' : 'layouts.eic')

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
            <!-- Dynamic Officer Box Cards Rendered by manage-accounts.js -->
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
            
            <div class="form-field">
                <label for="officer-input-student-id">Student Number *</label>
                <input 
                    type="text" 
                    id="officer-input-student-id" 
                    name="student_number"
                    class="form-input" 
                    placeholder="e.g. 2024-00123-BN-0" 
                    required>
            </div>

            <div class="form-field">
                <label for="officer-input-name">Full Name *</label>
                <input 
                    type="text" 
                    id="officer-input-name" 
                    name="full_name"
                    class="form-input" 
                    placeholder="e.g. Maria Clara Santos" 
                    required>
            </div>

            <div class="form-field">
                <label for="officer-input-role">Role *</label>
                <select id="officer-input-role" name="role_id" class="form-select" required>
                    <option value="" disabled selected>Select role...</option>
                    @foreach($roles ?? [] as $roleItem)
                        <option value="{{ $roleItem->role_name }}" data-id="{{ $roleItem->id }}">{{ $roleItem->role_name }}</option>
                    @endforeach
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
                <select id="edit-role-select" name="role_id" class="form-select" required>
                    <option value="" disabled selected>Select role...</option>
                    @foreach($roles ?? [] as $roleItem)
                        <option value="{{ $roleItem->role_name }}" data-id="{{ $roleItem->id }}">{{ $roleItem->role_name }}</option>
                    @endforeach
                </select>
            </div>

            <div class="modal-single-btn-footer">
                <button type="submit" class="btn-modal-submit-maroon">
                    <i class="fa-solid fa-check"></i>
                    <span>Save Role</span>
                </button>
            </div>

        </form>

    </div>
</div>

<!-- Toast Notifications Fallback Container -->
<div id="toast-container" class="toast-container" aria-live="polite"></div>
@endsection

@push('scripts')
    <script>
        window.OFFICER_DATA = @json($officers ?? []);
        window.AVAILABLE_ROLES = @json($roles ?? []);
        window.__ACCOUNT_ROUTES__ = {
            base: "{{ url(request()->is('executive*') ? '/executive/manage-accounts' : '/eic/manage-accounts') }}",
            store: "{{ url(request()->is('executive*') ? '/executive/manage-accounts' : '/eic/manage-accounts') }}",
            updateRole: "{{ url(request()->is('executive*') ? '/executive/manage-accounts' : '/eic/manage-accounts') }}",
            toggleStatus: "{{ url(request()->is('executive*') ? '/executive/manage-accounts' : '/eic/manage-accounts') }}"
        };
    </script>
    <script src="{{ asset('js/executive-manage-accounts.js') }}"></script>
@endpush

