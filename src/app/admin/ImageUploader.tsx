'use client';

import { useState, useRef } from 'react';
import styles from './ImageUploader.module.css';

interface Props {
  currentUrl: string;
  onUpload: (url: string) => void;
}

export default function ImageUploader({ currentUrl, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentUrl);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file) return;

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, WebP and GIF images allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    setError('');
    setUploading(true);

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setPreview(data.url);
      onUpload(data.url);

    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setPreview(currentUrl); // revert preview
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function clearImage() {
    setPreview('');
    onUpload('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className={styles.uploader}>
      {/* CURRENT IMAGE PREVIEW */}
      {preview && (
        <div className={styles.previewWrap}>
          <img
            src={preview}
            alt="Product preview"
            className={styles.preview}
            onError={() => {
              setPreview('');
              onUpload('');
            }}
          />
          <div className={styles.previewActions}>
            <button
              type="button"
              className={styles.replaceBtn}
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? '⏳ Uploading…' : '↑ Replace Image'}
            </button>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={clearImage}
              disabled={uploading}
            >
              ✕ Remove
            </button>
          </div>
        </div>
      )}

      {/* UPLOAD ZONE — shown when no image or as fallback */}
      {!preview && (
        <div
          className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''} ${uploading ? styles.uploading : ''}`}
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className={styles.uploadingState}>
              <div className={styles.spinner} />
              <p>Uploading image…</p>
            </div>
          ) : (
            <>
              <div className={styles.uploadIcon}>📷</div>
              <p className={styles.uploadTitle}>Click to upload or drag & drop</p>
              <p className={styles.uploadHint}>JPG, PNG, WebP or GIF · Max 5MB</p>
            </>
          )}
        </div>
      )}

      {/* UPLOADING OVERLAY on existing preview */}
      {uploading && preview && (
        <div className={styles.uploadOverlay}>
          <div className={styles.spinner} />
          <p>Uploading…</p>
        </div>
      )}

      {/* OR PASTE URL */}
      <div className={styles.urlRow}>
        <span className={styles.orDivider}>or paste image URL</span>
        <input
          type="url"
          className={styles.urlInput}
          placeholder="https://example.com/image.jpg"
          value={preview}
          onChange={e => {
            setPreview(e.target.value);
            onUpload(e.target.value);
          }}
        />
      </div>

      {/* SPECS BOX — always visible */}
      <div className={styles.specsBox}>
        <p className={styles.specsTitle}>Recommended image specs</p>
        <p className={styles.specsLine}>800 × 800 px · Square (1:1)</p>
        <p className={styles.specsLine}>JPG format · 72 dpi</p>
        <p className={styles.specsLine}>80–85% quality · under 300KB</p>
        <p className={styles.specsLine}>RGB color mode</p>
      </div>

      {error && <p className={styles.error}>⚠ {error}</p>}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className={styles.hiddenInput}
        onChange={handleInputChange}
      />
    </div>
  );
}
