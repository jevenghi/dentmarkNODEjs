// Retain the calendar date and the offset at local midnight in the URL.
export const getLocalDateBoundary = (value, daysToAdd = 0) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day + daysToAdd);
  const pad = (number) => String(number).padStart(2, '0');
  const offset = -date.getTimezoneOffset();
  const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const offsetPart = `${offset >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
  return `${datePart}T00:00:00${offsetPart}`;
};
