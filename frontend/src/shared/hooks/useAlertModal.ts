import { useCallback, useMemo, useState } from "react";
import type { AlertModalProps } from "@/shared/components/AlertModal";

type AlertOptions = {
  title?: string;
  message: string;
};

type AlertState = {
  open: boolean;
  title?: string;
  message: string;
};

export function useAlertModal() {
  const [state, setState] = useState<AlertState>({ open: false, title: undefined, message: "" });

  const openAlert = useCallback((options: AlertOptions) => {
    setState({ open: true, title: options.title, message: options.message });
  }, []);

  const closeAlert = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const alertProps: AlertModalProps = useMemo(
    () => ({
      open: state.open,
      title: state.title,
      message: state.message,
      onClose: closeAlert,
    }),
    [state.open, state.title, state.message, closeAlert],
  );

  return { openAlert, closeAlert, alertProps };
}
