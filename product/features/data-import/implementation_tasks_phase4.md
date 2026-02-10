# Implementation Tasks - Phase 4: UI Layer

**Feature**: Optional Bookmark & Spreadsheet Import  
**Phase**: UI Layer (Frontend Components)  
**Dependencies**: Phase 1 (Domain), Phase 2 (API), Phase 3 (Database)  
**Estimated Duration**: 2-3 days

## Phase Overview

Phase 4 implements the user interface for the import feature, including file upload, import preview, progress tracking, and confirmation screens.

## Phase Completion Criteria

- [ ] Import wizard component implemented
- [ ] File upload interface implemented
- [ ] Import preview interface implemented
- [ ] Progress tracking UI implemented
- [ ] Error handling UI implemented
- [ ] E2E tests passing (>90% coverage)
- [ ] Accessibility requirements met

---

## Task 4.1: Create Import Wizard Component

**File**: `src/components/import/ImportWizard.tsx`

**Description**: Create multi-step wizard for import flow.

**Acceptance Criteria**:
- Multi-step wizard with progress indicator
- Step validation before proceeding
- Back/Next navigation
- Cancel import option

**Implementation Details**:
```typescript
// src/components/import/ImportWizard.tsx

'use client';

import { useState } from 'react';

type ImportStep = 'upload' | 'preview' | 'confirm' | 'complete';

interface ImportWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function ImportWizard({ onComplete, onCancel }: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [importId, setImportId] = useState<string | null>(null);
  
  const steps = [
    { id: 'upload', label: 'Upload File', order: 1 },
    { id: 'preview', label: 'Preview Data', order: 2 },
    { id: 'confirm', label: 'Confirm Import', order: 3 },
    { id: 'complete', label: 'Complete', order: 4 }
  ];
  
  const currentStepOrder = steps.find(s => s.id === currentStep)?.order || 1;
  
  return (
    <div className="import-wizard">
      {/* Progress Indicator */}
      <div className="wizard-progress">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`step ${step.order <= currentStepOrder ? 'active' : ''}`}
          >
            <div className="step-number">{step.order}</div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>
      
      {/* Step Content */}
      <div className="wizard-content">
        {currentStep === 'upload' && (
          <FileUploadStep
            onNext={(id) => {
              setImportId(id);
              setCurrentStep('preview');
            }}
            onCancel={onCancel}
          />
        )}
        
        {currentStep === 'preview' && importId && (
          <PreviewStep
            importId={importId}
            onNext={() => setCurrentStep('confirm')}
            onBack={() => setCurrentStep('upload')}
            onCancel={onCancel}
          />
        )}
        
        {currentStep === 'confirm' && importId && (
          <ConfirmStep
            importId={importId}
            onNext={() => setCurrentStep('complete')}
            onBack={() => setCurrentStep('preview')}
            onCancel={onCancel}
          />
        )}
        
        {currentStep === 'complete' && (
          <CompleteStep onComplete={onComplete} />
        )}
      </div>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- ImportWizard.test.tsx
```

**Dependencies**: None

**Estimated Time**: 2 hours

---

## Task 4.2: Create File Upload Component

**File**: `src/components/import/FileUploadStep.tsx`

**Description**: Create file upload interface with drag-and-drop support.

**Acceptance Criteria**:
- Drag-and-drop file upload
- Click to browse file selection
- File type validation (CSV only)
- File size validation (5MB max)
- Upload progress indicator

**Implementation Details**:
```typescript
// src/components/import/FileUploadStep.tsx

'use client';

import { useState, useCallback } from 'react';

interface FileUploadStepProps {
  onNext: (importId: string) => void;
  onCancel: () => void;
}

export function FileUploadStep({ onNext, onCancel }: FileUploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);
  
  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    
    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Only CSV files are supported');
      return;
    }
    
    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }
    
    setFile(selectedFile);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/import/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const data = await response.json();
      onNext(data.import_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="file-upload-step">
      <h2>Upload CSV File</h2>
      
      <div
        className={`drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <p>Drag and drop your CSV file here</p>
            <p>or</p>
            <input
              type="file"
              id="file-input"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input" className="btn-browse">
              Browse Files
            </label>
          </>
        ) : (
          <div className="file-info">
            <p>Selected: {file.name}</p>
            <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
            <button onClick={() => setFile(null)} className="btn-remove">
              Remove
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      <div className="actions">
        <button onClick={onCancel} disabled={uploading}>
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="btn-primary"
        >
          {uploading ? 'Uploading...' : 'Upload and Continue'}
        </button>
      </div>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- FileUploadStep.test.tsx
```

**Dependencies**: Task 4.1

**Estimated Time**: 3 hours

---

## Task 4.3: Create Import Preview Component

**File**: `src/components/import/PreviewStep.tsx`

**Description**: Display preview of imported data before confirmation.

**Acceptance Criteria**:
- Display table of imported series
- Show valid/invalid/duplicate counts
- Display error messages for invalid items
- Pagination for large datasets
- Filter by status

**Implementation Details**:
```typescript
// src/components/import/PreviewStep.tsx

'use client';

import { useState, useEffect } from 'react';

interface PreviewStepProps {
  importId: string;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export function PreviewStep({ importId, onNext, onBack, onCancel }: PreviewStepProps) {
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    fetchPreview();
  }, [importId, page]);
  
  const fetchPreview = async () => {
    try {
      const response = await fetch(
        `/api/import/${importId}/preview?page=${page}&limit=50`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load preview');
      }
      
      const data = await response.json();
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div>Loading preview...</div>;
  }
  
  if (error) {
    return (
      <div>
        <p className="error-message">{error}</p>
        <button onClick={onBack}>Go Back</button>
      </div>
    );
  }
  
  return (
    <div className="preview-step">
      <h2>Preview Import Data</h2>
      
      <div className="summary">
        <div className="stat">
          <span className="label">Total Items:</span>
          <span className="value">{preview.total}</span>
        </div>
        <div className="stat valid">
          <span className="label">Valid:</span>
          <span className="value">{preview.valid_count}</span>
        </div>
        <div className="stat invalid">
          <span className="label">Invalid:</span>
          <span className="value">{preview.invalid_count}</span>
        </div>
        <div className="stat duplicate">
          <span className="label">Duplicates:</span>
          <span className="value">{preview.duplicate_count}</span>
        </div>
      </div>
      
      <table className="preview-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Chapter</th>
            <th>Platform</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {preview.items.map((item: any, index: number) => (
            <tr key={index} className={item.status}>
              <td>{item.title}</td>
              <td>{item.chapter || '-'}</td>
              <td>{item.platform || 'Unknown'}</td>
              <td>
                <span className={`badge ${item.status}`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={preview.items.length < 50}
        >
          Next
        </button>
      </div>
      
      <div className="actions">
        <button onClick={onBack}>Back</button>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onNext} className="btn-primary">
          Continue to Confirm
        </button>
      </div>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- PreviewStep.test.tsx
```

**Dependencies**: Task 4.1, Phase 2 API

**Estimated Time**: 3 hours

---

## Task 4.4: Create Import Confirmation Component

**File**: `src/components/import/ConfirmStep.tsx`

**Description**: Final confirmation before executing import.

**Acceptance Criteria**:
- Display import summary
- Show warnings for skipped items
- Confirmation checkbox
- Execute import on confirmation
- Display progress during import

**Implementation Details**:
```typescript
// src/components/import/ConfirmStep.tsx

'use client';

import { useState } from 'react';

interface ConfirmStepProps {
  importId: string;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export function ConfirmStep({ importId, onNext, onBack, onCancel }: ConfirmStepProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleConfirm = async () => {
    if (!confirmed) return;
    
    setImporting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/import/${importId}/confirm`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Import failed');
      }
      
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setImporting(false);
    }
  };
  
  return (
    <div className="confirm-step">
      <h2>Confirm Import</h2>
      
      <div className="confirmation-message">
        <p>
          You are about to import your reading history. This action will add
          the validated series to your library.
        </p>
        <p>
          Items marked as invalid or duplicate will be skipped.
        </p>
      </div>
      
      <div className="confirmation-checkbox">
        <input
          type="checkbox"
          id="confirm-checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          disabled={importing}
        />
        <label htmlFor="confirm-checkbox">
          I understand and want to proceed with the import
        </label>
      </div>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      {importing && (
        <div className="import-progress">
          <div className="spinner" />
          <p>Importing your series... This may take a few moments.</p>
        </div>
      )}
      
      <div className="actions">
        <button onClick={onBack} disabled={importing}>
          Back
        </button>
        <button onClick={onCancel} disabled={importing}>
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!confirmed || importing}
          className="btn-primary"
        >
          {importing ? 'Importing...' : 'Confirm Import'}
        </button>
      </div>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- ConfirmStep.test.tsx
```

**Dependencies**: Task 4.1, Phase 2 API

**Estimated Time**: 2 hours

---

## Task 4.5: Create Import Complete Component

**File**: `src/components/import/CompleteStep.tsx`

**Description**: Display import completion message and summary.

**Acceptance Criteria**:
- Display success message
- Show import statistics
- Link to imported series
- Option to import more

**Implementation Details**:
```typescript
// src/components/import/CompleteStep.tsx

'use client';

interface CompleteStepProps {
  onComplete: () => void;
}

export function CompleteStep({ onComplete }: CompleteStepProps) {
  return (
    <div className="complete-step">
      <div className="success-icon">✓</div>
      
      <h2>Import Complete!</h2>
      
      <p>
        Your reading history has been successfully imported. You can now view
        your series in the dashboard.
      </p>
      
      <div className="actions">
        <button onClick={onComplete} className="btn-primary">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- CompleteStep.test.tsx
```

**Dependencies**: Task 4.1

**Estimated Time**: 1 hour

---

## Task 4.6: Create Import Page

**File**: `src/app/import/page.tsx`

**Description**: Create import page that uses ImportWizard component.

**Acceptance Criteria**:
- Protected route (authentication required)
- Uses ImportWizard component
- Redirects to dashboard on completion
- Handle navigation away from page

**Implementation Details**:
```typescript
// src/app/import/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { ImportWizard } from '@/components/import/ImportWizard';

export default function ImportPage() {
  const router = useRouter();
  
  const handleComplete = () => {
    router.push('/dashboard');
  };
  
  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel the import?')) {
      router.push('/dashboard');
    }
  };
  
  return (
    <div className="import-page">
      <ImportWizard onComplete={handleComplete} onCancel={handleCancel} />
    </div>
  );
}
```

**Verification**:
```bash
npm run dev
# Navigate to http://localhost:3000/import
```

**Dependencies**: All previous tasks

**Estimated Time**: 1 hour

---

## Phase 4 Completion Checklist

- [ ] Import wizard component implemented
- [ ] File upload interface implemented
- [ ] Import preview interface implemented
- [ ] Confirmation flow implemented
- [ ] Complete screen implemented
- [ ] Import page created
- [ ] All E2E tests passing (>90% coverage)
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Mobile responsive design verified
- [ ] Error handling tested
- [ ] Code review approved
- [ ] Ready for production

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]
