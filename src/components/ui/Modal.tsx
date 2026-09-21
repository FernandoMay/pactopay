import { type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, children, maxWidth = "max-w-md" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-surface-container-lowest rounded-2xl ${maxWidth} w-full shadow-xl relative`}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({
  icon,
  iconBg = "bg-secondary-container text-on-secondary-container",
  title,
  onClose,
}: {
  icon: string;
  iconBg?: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors z-10"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>
      <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-space-md shadow-sm`}>
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-center text-on-surface px-space-lg">
        {title}
      </h3>
    </>
  );
}
