const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}
