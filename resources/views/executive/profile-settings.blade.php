@extends('layouts.executive')

@section('title', 'Profile Settings')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/shared-profile-settings.css') }}">
@endpush

@section('content')
<main class="content-container">

    <div class="profile-settings-container">
        
        <!-- Page Header -->
        <div class="profile-header-row">
            <div class="profile-title-wrap">
                <h1>Profile Settings</h1>
                <p class="text-xs text-slate-500 mt-0.5">Manage your personal credentials, assigned desk, and account security.</p>
            </div>
        </div>

        <!-- 2-Column Responsive Settings Grid -->
        <div class="profile-settings-grid">
            
            <!-- ====================================================== -->
            <!-- CARD 1: EXECUTIVE PROFILE INFORMATION                 -->
            <!-- ====================================================== -->
            <section class="settings-card" aria-labelledby="exec-info-heading">
                <div class="settings-card-header">
                    <div class="settings-card-icon">
                        <i class="fa-regular fa-id-badge"></i>
                    </div>
                    <div class="settings-card-titles">
                        <h2 id="exec-info-heading">{{ Auth::user()?->role?->role_name ?? 'Executive' }} Profile</h2>
                        <p>Update your personal details and author profile photo.</p>
                    </div>
                </div>

                <form id="profile-info-form" action="{{ route('profile.update-info') }}" method="POST" enctype="multipart/form-data" class="settings-card-body" novalidate>
                    @csrf
                    
                    <!-- Profile Picture Upload Row -->
                    <div class="profile-avatar-row">
                        <div class="avatar-preview-wrapper">
                            <img id="avatar-preview-img" class="avatar-preview-img" src="{{ Auth::user()?->avatar_url ?? (Auth::user()?->avatar ? asset(Auth::user()->avatar) : asset('images/member-placeholder.svg')) }}" alt="Avatar">
                        </div>
                        <div class="avatar-upload-info">
                            <span class="settings-label">Profile Picture</span>
                            <div class="avatar-actions-group">
                                <button type="button" id="btn-change-avatar" class="btn-upload-avatar">
                                    <i class="fa-solid fa-arrow-up-from-bracket"></i>
                                    <span>Upload Photo</span>
                                </button>
                                <button type="button" id="btn-reset-avatar" class="btn-reset-avatar" title="Reset to default placeholder">
                                    <i class="fa-regular fa-trash-can"></i>
                                    <span>Remove</span>
                                </button>
                                <!-- Hidden Native File Input -->
                                <input type="file" id="avatar-file-input" name="avatar" accept="image/png, image/jpeg, image/webp" style="display: none;" aria-label="Upload profile picture">
                                <input type="hidden" name="remove_avatar" id="input-remove-avatar" value="0">
                            </div>
                            <p class="avatar-hint-text">Supported formats: JPG, PNG, or WEBP.</p>
                        </div>
                    </div>

                    <!-- Student Number Field -->
                    <div class="settings-field-group">
                        <label for="input-student-number" class="settings-label">
                            <span>Student Number <span class="req">*</span></span>
                        </label>
                        <input 
                            type="text" 
                            id="input-student-number" 
                            name="student_number"
                            class="settings-input" 
                            placeholder="Enter your student number" 
                            value="{{ Auth::user()->student_number }}"
                            required 
                            maxlength="30"
                            autocomplete="off"
                        >
                    </div>

                    <!-- Full Name Field -->
                    <div class="settings-field-group">
                        <label for="input-full-name" class="settings-label">
                            <span>Full Name <span class="req">*</span></span>
                        </label>
                        <input 
                            type="text" 
                            id="input-full-name" 
                            name="full_name"
                            class="settings-input" 
                            placeholder="Enter your full name" 
                            value="{{ Auth::user()->full_name }}"
                            required 
                            maxlength="80"
                            autocomplete="name"
                        >
                    </div>

                    <!-- Role Field -->
                    <div class="settings-field-group">
                        <label for="input-officer-role" class="settings-label">
                            <span>Role</span>
                        </label>
                        <input 
                            type="text" 
                            id="input-officer-role" 
                            class="settings-input" 
                            readonly 
                            value="{{ Auth::user()->role->role_name ?? 'Executive' }}"
                            aria-readonly="true"
                        >
                    </div>

                    <!-- Submit Action -->
                    <div class="card-actions-row">
                        <button type="submit" id="btn-save-profile" class="btn-update-maroon">
                            <i class="fa-solid fa-check"></i>
                            <span>Save Profile</span>
                        </button>
                    </div>

                </form>
            </section>

            <!-- ====================================================== -->
            <!-- CARD 2: SECURITY & PASSWORD CHANGE                      -->
            <!-- ====================================================== -->
            <section class="settings-card" aria-labelledby="security-heading">
                <div class="settings-card-header">
                    <div class="settings-card-icon">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <div class="settings-card-titles">
                        <h2 id="security-heading">Password &amp; Security</h2>
                        <p>Manage your account password and security credentials.</p>
                    </div>
                </div>

                <form id="password-change-form" action="{{ route('profile.update-password') }}" method="POST" class="settings-card-body" novalidate>
                    @csrf
                    
                    <!-- Current Password Field -->
                    <div class="settings-field-group">
                        <label for="input-current-password" class="settings-label">
                            <span>Current Password <span class="req">*</span></span>
                        </label>
                        <div class="password-input-wrapper">
                            <input 
                                type="password" 
                                id="input-current-password" 
                                name="current_password"
                                class="settings-input" 
                                placeholder="Enter current password" 
                                required 
                                autocomplete="current-password"
                            >
                            <button type="button" class="password-toggle-btn" data-target="input-current-password" aria-label="Toggle current password visibility">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <!-- New Password Field -->
                    <div class="settings-field-group">
                        <label for="input-new-password" class="settings-label">
                            <span>New Password <span class="req">*</span></span>
                        </label>
                        <div class="password-input-wrapper">
                            <input 
                                type="password" 
                                id="input-new-password" 
                                name="new_password"
                                class="settings-input" 
                                placeholder="Enter new password" 
                                required 
                                minlength="6"
                                autocomplete="new-password"
                            >
                            <button type="button" class="password-toggle-btn" data-target="input-new-password" aria-label="Toggle new password visibility">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Confirm New Password Field -->
                    <div class="settings-field-group">
                        <label for="input-confirm-password" class="settings-label">
                            <span>Confirm New Password <span class="req">*</span></span>
                        </label>
                        <div class="password-input-wrapper">
                            <input 
                                type="password" 
                                id="input-confirm-password" 
                                name="new_password_confirmation"
                                class="settings-input" 
                                placeholder="Confirm new password" 
                                required 
                                minlength="6"
                                autocomplete="new-password"
                            >
                            <button type="button" class="password-toggle-btn" data-target="input-confirm-password" aria-label="Toggle confirm password visibility">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Password Requirement Checklist -->
                    <div class="password-criteria-list">
                        <div class="password-criteria-item" id="crit-length">
                            <i class="fa-solid fa-circle-check"></i>
                            <span>Minimum 6 characters</span>
                        </div>
                        <div class="password-criteria-item" id="crit-match">
                            <i class="fa-solid fa-circle-check"></i>
                            <span>New and confirm passwords must match</span>
                        </div>
                    </div>

                    <!-- Submit Action -->
                    <div class="card-actions-row">
                        <button type="submit" id="btn-update-password" class="btn-update-maroon">
                            <i class="fa-solid fa-key"></i>
                            <span>Update Password</span>
                        </button>
                    </div>

                </form>
            </section>

        </div>

    </div>

</main>

<!-- Toast Notification Container -->
<div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="true"></div>
@endsection

@push('scripts')
    <script src="{{ asset('js/shared-profile-settings.js') }}"></script>
@endpush

