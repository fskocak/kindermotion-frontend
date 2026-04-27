export default function ChildProfilesIndexPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-[2rem] bg-[var(--surface-container-low)] p-12 text-center shadow-inner">
      <h3 className="mb-2 text-xl font-bold tracking-[-0.02em] text-[var(--on-surface)]">
        Child Profiles
      </h3>
      <p className="max-w-md text-[15px] leading-relaxed text-[var(--on-surface-variant)]">
        To view a child&apos;s profile, please navigate to your classes and
        select a specific student from the roster.
      </p>
    </div>
  );
}
