import React from 'react';
import { ConfirmationModal } from './ConfirmationModal';

interface CancelOrderModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({ visible, onClose, onConfirm }) => {
    return (
        <ConfirmationModal
            visible={visible}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Cancel Order?"
            subtitle="Are you sure you want to cancel this order? All items in your cart will be removed."
            cancelText="No, Keep it"
            confirmText="Yes, Cancel"
        />
    );
};
