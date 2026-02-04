import { useCallback, useState } from 'react';
import { UseFormSetError, FieldPath, FieldValues } from 'react-hook-form';
import { ApiError } from '@/lib/errors';
import { showErrorToast } from '@/lib/errors/toastErrorHandler';

interface UseFormApiErrorOptions {
  /** Show toast for non-field errors */
  showToast?: boolean;
}

/**
 * Hook for handling API errors in forms.
 * Automatically maps field errors to react-hook-form fields.
 */
export function useFormApiError<TFormValues extends FieldValues>(
  setError: UseFormSetError<TFormValues>,
  options: UseFormApiErrorOptions = { showToast: true }
) {
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleError = useCallback(
    (error: unknown) => {
      const apiError = ApiError.fromError(error);
      setGeneralError(null);

      if (apiError.isValidationError && apiError.fieldErrors.length > 0) {
        // Map field errors to form
        let hasFieldError = false;

        apiError.fieldErrors.forEach((fieldError) => {
          try {
            setError(fieldError.field as FieldPath<TFormValues>, {
              type: 'server',
              message: fieldError.message,
            });
            hasFieldError = true;
          } catch {
            // Field doesn't exist in form, treat as general error
          }
        });

        // If no fields matched, show as general error
        if (!hasFieldError) {
          setGeneralError(apiError.getUserMessage());
          if (options.showToast) {
            showErrorToast(error);
          }
        }
      } else {
        // Non-validation error
        setGeneralError(apiError.getUserMessage());
        if (options.showToast) {
          showErrorToast(error);
        }
      }

      return apiError;
    },
    [setError, options.showToast]
  );

  const clearError = useCallback(() => {
    setGeneralError(null);
  }, []);

  return {
    handleError,
    generalError,
    clearError,
  };
}
