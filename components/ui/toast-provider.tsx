import React, { createContext, useContext, useState } from "react";
import { SuccessToast } from "./success-toast";

interface ToastContextType {
  showToast: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    visible: boolean;
    duration: number;
  }>({
    message: "",
    visible: false,
    duration: 3000,
  });

  const showToast = (message: string, duration = 3000) => {
    setToast({ message, visible: true, duration });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <SuccessToast
        message={toast.message}
        visible={toast.visible}
        duration={toast.duration}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

