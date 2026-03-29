import { useEffect, useMemo, useState } from 'react';
import type { RiderDocumentKind, RiderSession, VerificationStatus } from '../../../types/rider';
import { uploadImageWithRetry } from '../../../lib/cloudinary/upload';
import { submitRiderForReview, updateRiderDocumentsDraft, updateRiderDraft } from '../../../lib/firebase/riderRepository';
import { validateDocumentCompleteness, validateImageFile, validatePersonalInfo, validateVehicleInfo } from '../../../utils/validation';

interface UploadState {
  progress: number;
  uploading: boolean;
  error: string | null;
}

const emptyUploadState: UploadState = {
  progress: 0,
  uploading: false,
  error: null,
};

export function useRiderOnboarding(session: RiderSession) {
  const [draft, setDraft] = useState({
    fullName: session.rider.fullName,
    nidaNumber: session.documents.nidaNumber,
    plateNumber: session.documents.plateNumber,
    vehicleType: session.documents.vehicleType ?? 'bodaboda',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentDraft, setDocumentDraft] = useState(session.documents);
  const [selectedFiles, setSelectedFiles] = useState<Partial<Record<RiderDocumentKind, File>>>({});
  const [uploadStates, setUploadStates] = useState<Record<RiderDocumentKind, UploadState>>({
    nidaImage: emptyUploadState,
    licenseImage: emptyUploadState,
    selfieImage: emptyUploadState,
  });

  useEffect(() => {
    setDraft({
      fullName: session.rider.fullName,
      nidaNumber: session.documents.nidaNumber,
      plateNumber: session.documents.plateNumber,
      vehicleType: session.documents.vehicleType ?? 'bodaboda',
    });
  }, [session.documents.nidaNumber, session.documents.plateNumber, session.documents.vehicleType, session.rider.fullName]);

  useEffect(() => {
    setDocumentDraft(session.documents);
  }, [session.documents]);

  const canResubmit = useMemo(
    () =>
      session.rider.verificationStatus === 'draft' ||
      session.rider.verificationStatus === 'needs_resubmission' ||
      session.rider.verificationStatus === 'rejected',
    [session.rider.verificationStatus],
  );

  function updateField(name: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
    setFormError(null);
  }

  function selectFile(kind: RiderDocumentKind, file: File | null) {
    if (!file) {
      setSelectedFiles((current) => {
        const next = { ...current };
        delete next[kind];
        return next;
      });
      setUploadStates((current) => ({ ...current, [kind]: emptyUploadState }));
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setUploadStates((current) => ({
        ...current,
        [kind]: {
          progress: 0,
          uploading: false,
          error: validationError,
        },
      }));
      return;
    }

    setSelectedFiles((current) => ({ ...current, [kind]: file }));
    setUploadStates((current) => ({
      ...current,
      [kind]: {
        progress: 0,
        uploading: false,
        error: null,
      },
    }));
  }

  async function savePersonalInfo() {
    const errors = validatePersonalInfo(draft);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      await updateRiderDraft(session.rider.uid, draft, 'vehicle_info');
      return true;
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save personal information.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function saveVehicleInfo() {
    const errors = validateVehicleInfo(draft);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      await updateRiderDraft(session.rider.uid, draft, 'documents');
      return true;
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save vehicle information.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadDocument(kind: RiderDocumentKind) {
    const file = selectedFiles[kind];
    if (!file) {
      return true;
    }

    setUploadStates((current) => ({
      ...current,
      [kind]: { progress: 0, uploading: true, error: null },
    }));

    try {
      const asset = await uploadImageWithRetry(file, {
        folder: `rider_documents/${session.rider.uid}`,
        tags: ['rider-onboarding', kind],
        context: {
          uid: session.rider.uid,
          kind,
        },
        retries: 2,
        onProgress: (progress) => {
          setUploadStates((current) => ({
            ...current,
            [kind]: { progress, uploading: true, error: null },
          }));
        },
      });

      await updateRiderDocumentsDraft(session.rider.uid, {
        [kind]: asset,
        uploadMetadata: {
          ...documentDraft.uploadMetadata,
          [kind]: {
            fileName: file.name,
            bytes: file.size,
            mimeType: file.type,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      setDocumentDraft((current) => ({
        ...current,
        [kind]: asset,
        uploadMetadata: {
          ...current.uploadMetadata,
          [kind]: {
            fileName: file.name,
            bytes: file.size,
            mimeType: file.type,
            uploadedAt: new Date().toISOString(),
          },
        },
      }));

      setUploadStates((current) => ({
        ...current,
        [kind]: { progress: 100, uploading: false, error: null },
      }));

      return true;
    } catch (error) {
      setUploadStates((current) => ({
        ...current,
        [kind]: {
          progress: 0,
          uploading: false,
          error: error instanceof Error ? error.message : 'Upload failed.',
        },
      }));
      return false;
    }
  }

  async function saveDocuments() {
    setIsSaving(true);
    setFormError(null);

    try {
      const kinds: RiderDocumentKind[] = ['nidaImage', 'licenseImage', 'selfieImage'];
      for (const kind of kinds) {
        const ok = await uploadDocument(kind);
        if (!ok) {
          setFormError('One or more uploads failed. Fix the highlighted document and try again.');
          return false;
        }
      }

      const errors = validateDocumentCompleteness(documentDraft);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setFormError('Upload all required documents before continuing.');
        return false;
      }

      return true;
    } finally {
      setIsSaving(false);
    }
  }

  async function submitForReview(note?: string) {
    const personalErrors = validatePersonalInfo(draft);
    const vehicleErrors = validateVehicleInfo(draft);
    const documentErrors = validateDocumentCompleteness(documentDraft);
    const combinedErrors = { ...personalErrors, ...vehicleErrors, ...documentErrors } as Record<string, string>;

    if (Object.keys(combinedErrors).length > 0) {
      setFieldErrors(combinedErrors);
      setFormError('Complete every required onboarding field before submitting.');
      return false;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await submitRiderForReview(session.rider.uid, note, session.rider.verificationStatus as VerificationStatus);
      return true;
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Submission failed.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    canResubmit,
    draft,
    fieldErrors,
    formError,
    isSaving,
    isSubmitting,
    selectedFiles,
    uploadStates,
    documentDraft,
    updateField,
    selectFile,
    savePersonalInfo,
    saveVehicleInfo,
    saveDocuments,
    submitForReview,
  };
}
