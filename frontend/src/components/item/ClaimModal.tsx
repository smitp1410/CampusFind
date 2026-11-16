import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Item } from '../../types';
import { api } from '../../services/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { ImageUpload } from '../ui/ImageUpload';
import confetti from 'canvas-confetti';

interface ClaimModalProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess?: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  isOpen,
  onClose,
  onClaimSuccess,
}) => {
  const [proof, setProof] = useState('');
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof.trim() || proof.trim().length < 15) {
      setError('Please provide at least 15 characters describing distinguishing ownership details.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.submitClaim({
        item_id: item.id,
        ownership_proof: proof.trim(),
        proof_image_url: proofImages.length > 0 ? proofImages[0] : undefined,
      });

      setSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        if (onClaimSuccess) onClaimSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setProof('');
    setProofImages([]);
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Submit Ownership Claim"
      subtitle={`Item #${item.id} // ${item.title}`}
      maxWidth="lg"
    >
      {success ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-14 h-14 bg-campus-lime text-campus-charcoal border-2 border-campus-charcoal mx-auto flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h4 className="font-serif font-bold text-2xl text-campus-charcoal">
            Claim Successfully Submitted
          </h4>
          <p className="text-sm text-campus-charcoal/70 max-w-md mx-auto leading-relaxed">
            Your ownership proof has been routed to Campus Security for review. You will receive an in-app notification once staff verifies your claim and schedules handover.
          </p>
          <div className="pt-4">
            <Button variant="primary" onClick={handleReset}>
              Return to Item
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Privacy Security Notice */}
          <div className="p-3.5 bg-campus-forest/5 border border-campus-forest/20 text-xs text-campus-forest flex items-start space-x-2.5">
            <Lock className="w-4 h-4 mt-0.5 shrink-0 text-campus-forest" />
            <div className="leading-relaxed">
              <strong className="font-semibold block font-mono uppercase">
                Privacy Guaranteed
              </strong>
              Your ownership explanation is strictly confidential and is only visible to authorized campus safety officers inspecting the item.
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-campus-charcoal mb-1.5">
              Specific Ownership Proof & Unique Markers *
            </label>
            <p className="text-xs text-campus-charcoal/60 mb-2 leading-relaxed">
              Describe details that only the true owner would know: lockscreen wallpaper, serial number prefix, stickers, scratches, contents of inner pockets, or purchase proof.
            </p>
            <Textarea
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="e.g. 'The laptop has an MIT sticker in the upper right lid, and the lockscreen wallpaper shows a gray mountain range...'"
              rows={4}
              error={error || undefined}
              required
            />
          </div>

          <div>
            <ImageUpload
              value={proofImages}
              onChange={setProofImages}
              maxImages={1}
              label="Optional Supporting Photo / Receipt"
              helperText="Upload a receipt, warranty card, or photo of you with the item (Max 5MB)."
            />
          </div>

          <div className="pt-3 border-t border-campus-charcoal/20 flex items-center justify-end space-x-3">
            <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="lime"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Verify & Submit Claim
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
