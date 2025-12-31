export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirm: (payments: {
    cash: number;
    sinpe: number;
    card: number;
  }) => void;
}