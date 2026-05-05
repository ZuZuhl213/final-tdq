import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useToastStore from "@/stores/toastStore";
import { AxiosError } from "axios";

interface UseApiErrorHandlerOptions {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useApiErrorHandler = (options: UseApiErrorHandlerOptions = {}) => {
  const {
    showSuccessToast = true,
    successMessage = "Operation completed successfully",
    showErrorToast = true,
    onSuccess,
    onError,
  } = options;
  const addToast = useToastStore((state) => state.addToast || state.push);

  const handleSuccess = () => {
    if (showSuccessToast) {
      addToast(successMessage, "success");
    }
    onSuccess?.();
  };

  const handleError = (error: AxiosError<any>) => {
    if (showErrorToast) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.message ||
        "An error occurred";
      addToast(errorMessage, "error");
    }
    onError?.(error);
  };

  return { handleSuccess, handleError, addToast };
};

export const usePaginatedQuery = <T>(
  queryKey: (string | number | undefined)[],
  queryFn: (page?: number) => Promise<any>,
  options = {}
) => {
  return useQuery({
    queryKey,
    queryFn: (context: any) => queryFn(context.pageParam ?? 1),
    ...options,
  });
};

export const useApiMutation = <TData, TError = AxiosError>(
  mutationFn: (data: any) => Promise<TData>,
  options: UseApiErrorHandlerOptions = {}
) => {
  const queryClient = useQueryClient();
  const { handleSuccess, handleError } = useApiErrorHandler(options);

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries();
      handleSuccess();
    },
    onError: (error: TError) => {
      handleError(error as any);
    },
  });
};
