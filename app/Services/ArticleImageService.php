<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Article;
use App\Models\ArticleImage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ArticleImageService
{
    /**
     * Store and register an editorial visual asset.
     */
    public function storeImage(
        User $uploader,
        UploadedFile|string $fileOrData,
        string $imageType = 'photo',
        ?string $title = null,
        ?string $caption = null
    ): ArticleImage {
        $fileUrl = $this->resolveFileUrl($fileOrData, $imageType);

        $uploader->loadMissing('role');
        $roleName = $uploader->role?->role_name ?? '';

        $isSectionHead = in_array($roleName, [
            'Cartoonist Head',
            'Associate Cartoonist Head',
            'Chief Cartoonist',
            'Photojournalist Head',
            'Associate Media and Public Communications Head',
            'Media and Public Communications Head',
            'M&PC Head',
            'Associate M&PC Head',
        ], true);

        // Section Heads bypass head desk and submit directly to EIC
        $status = $isSectionHead ? 'pending_eic' : 'pending_head';
        $headApprovedBy = $isSectionHead ? $uploader->id : null;

        if (empty($title) && $fileOrData instanceof UploadedFile) {
            $rawName = pathinfo($fileOrData->getClientOriginalName(), PATHINFO_FILENAME);
            $title = Str::headline($rawName);
        }

        return ArticleImage::create([
            'uploader_id' => $uploader->id,
            'title' => $title ?: ($imageType === 'cartoon' ? 'Editorial Cartoon' : 'Editorial Photo'),
            'caption' => $caption,
            'image_type' => $imageType,
            'status' => $status,
            'head_approved_by' => $headApprovedBy,
            'file_url' => $fileUrl,
            'is_cover' => false,
        ]);
    }

    /**
     * Endorse image from Section Head to EIC.
     */
    public function endorseByHead(ArticleImage $image, User $head): ArticleImage
    {
        $image->update([
            'status' => 'pending_eic',
            'head_approved_by' => $head->id,
        ]);

        return $image;
    }

    /**
     * Return visual asset to artist for revision.
     */
    public function returnForRevision(ArticleImage $image, User $reviewer, string $remarks): ArticleImage
    {
        $image->update([
            'status' => 'revision',
            'remarks' => $remarks,
        ]);

        return $image;
    }

    /**
     * EIC approval of artwork into the publication library.
     */
    public function approveByEic(ArticleImage $image, User $eic): ArticleImage
    {
        $image->update([
            'status' => 'approved',
            'eic_approved_by' => $eic->id,
        ]);

        return $image;
    }

    /**
     * Assign image as the official cover of an article.
     */
    public function assignCoverToArticle(Article $article, int|string $imageId): ArticleImage
    {
        // Unset any previous cover for this article
        ArticleImage::where('article_id', $article->id)->update(['is_cover' => false]);

        $image = ArticleImage::findOrFail($imageId);
        $image->update([
            'article_id' => $article->id,
            'is_cover' => true,
            'status' => 'published',
        ]);

        return $image;
    }

    /**
     * Format ArticleImage model into standard dataset array for Views & JavaScript.
     *
     * @return array<string, mixed>
     */
    public function formatForView(ArticleImage $image): array
    {
        $displayStatus = match (strtolower(trim($image->status))) {
            'pending', 'pending_head', 'pending with head', 'pending review' => 'Pending with Head',
            'pending_eic', 'pending eic review' => 'Pending EIC Review',
            'approved', 'eic approved', 'approved_for_mpc' => 'EIC Approved',
            'revision', 'for revision', 'returned for revision' => 'For Revision',
            'published' => 'Published',
            default => 'Pending with Head',
        };

        $headName = $image->headApprover?->full_name;
        $headRole = $image->headApprover?->role?->role_name ?? 'Section Head';

        return [
            'id' => (string) $image->id,
            'title' => $image->title ?? ($image->image_type === 'cartoon' ? 'Editorial Cartoon' : 'Editorial Photo'),
            'caption' => $image->caption ?? '',
            'type' => $image->image_type,
            'artist' => $image->uploader?->full_name ?? 'Editorial Contributor',
            'author' => $image->uploader?->full_name ?? 'Editorial Contributor',
            'userId' => (string) $image->uploader_id,
            'studentNumber' => $image->uploader?->student_number ?? '',
            'uploaderRole' => $image->uploader?->role?->role_name ?? 'Contributor',
            'image' => $image->file_url,
            'date' => $image->created_at ? $image->created_at->format('M d, Y') : date('M d, Y'),
            'rawDate' => $image->created_at ? $image->created_at->toIso8601String() : now()->toIso8601String(),
            'status' => $displayStatus,
            'endorsedBy' => $headName ? "{$headName} ({$headRole})" : '',
            'endorsedDate' => $image->head_approved_by && $image->updated_at ? $image->updated_at->format('M d, Y') : '',
            'approvedBy' => $image->eicApprover ? ($image->eicApprover->full_name . ' (Editor-in-Chief)') : '',
            'remarks' => $image->remarks ?? '',
            'connectedArticleId' => (string) ($image->article_id ?? ''),
            'connectedArticleTitle' => $image->article?->title ?? '',
            'isCover' => (bool) $image->is_cover,
        ];
    }

    /**
     * Resolve file upload or data URL to a persistent accessible URL.
     */
    private function resolveFileUrl(UploadedFile|string $fileOrData, string $imageType): string
    {
        // 1. If an actual UploadedFile is provided
        if ($fileOrData instanceof UploadedFile) {
            $folderName = 'uploads/' . Str::plural($imageType);
            $destinationPath = public_path($folderName);

            if (!File::isDirectory($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true, true);
            }

            $extension = $fileOrData->getClientOriginalExtension() ?: 'png';
            $fileName = Str::uuid()->toString() . '.' . $extension;
            $fileOrData->move($destinationPath, $fileName);

            return asset($folderName . '/' . $fileName);
        }

        // 2. If a Base64 data URL string is provided
        if (is_string($fileOrData) && str_starts_with($fileOrData, 'data:image/')) {
            $folderName = 'uploads/' . Str::plural($imageType);
            $destinationPath = public_path($folderName);

            if (!File::isDirectory($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true, true);
            }

            // Extract mime type and base64 payload
            if (preg_match('/^data:image\/(\w+);base64,/', $fileOrData, $matches)) {
                $ext = $matches[1] === 'svg+xml' ? 'svg' : ($matches[1] === 'jpeg' ? 'jpg' : $matches[1]);
                $data = substr($fileOrData, strpos($fileOrData, ',') + 1);
                $decoded = base64_decode($data);
                if ($decoded !== false) {
                    $fileName = Str::uuid()->toString() . '.' . $ext;
                    File::put($destinationPath . '/' . $fileName, $decoded);
                    return asset($folderName . '/' . $fileName);
                }
            }

            // Fallback: store data URL directly
            return $fileOrData;
        }

        // 3. String URL already
        return (string) $fileOrData;
    }
}
