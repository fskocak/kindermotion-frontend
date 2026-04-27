import { type VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

type FormActionsProps = {
  onCancel?: () => void;
  cancelLabel?: string;
  submitLabel: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
  submitType?: "button" | "submit";
  onSubmitClick?: () => void;
  submitVariant?: ButtonVariant;
};

export function FormActions({
  onCancel,
  cancelLabel = "Cancel",
  submitLabel,
  submittingLabel,
  isSubmitting = false,
  isSubmitDisabled = false,
  submitType = "submit",
  onSubmitClick,
  submitVariant = "default",
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3">
      {onCancel ? (
        <Button type="button" variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
      ) : null}

      <Button
        type={submitType}
        variant={submitVariant}
        onClick={submitType === "button" ? onSubmitClick : undefined}
        disabled={isSubmitting || isSubmitDisabled}
      >
        {isSubmitting ? (submittingLabel ?? submitLabel) : submitLabel}
      </Button>
    </div>
  );
}
