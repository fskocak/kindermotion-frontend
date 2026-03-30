type TeacherStudentDetailFieldProps = {
  label: string;
  value: string | null | undefined;
  emptyLabel?: string;
};

export function TeacherStudentDetailField({
  label,
  value,
  emptyLabel = "Not provided",
}: TeacherStudentDetailFieldProps) {
  return (
    <div className="grid gap-2 rounded-[1.5rem] bg-[var(--surface-container-low)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
        {label}
      </p>
      <p className="text-sm leading-6 text-[var(--on-surface)]">
        {value && value.trim().length > 0 ? value : emptyLabel}
      </p>
    </div>
  );
}
