import type { CampusEvent } from "../data/types";
const zone = "America/New_York";
export function campusDay(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function campusDateTime(date: string, time: string): string {
  const offsetName = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    timeZoneName: "shortOffset",
  })
    .formatToParts(new Date(`${date}T12:00:00Z`))
    .find((p) => p.type === "timeZoneName")!.value;
  const offset = Number(offsetName.replace("GMT", ""));
  const suffix = `${offset < 0 ? "-" : "+"}${String(Math.abs(offset)).padStart(2, "0")}:00`;
  return new Date(`${date}T${time}:00${suffix}`).toISOString();
}
export const eventDate = (iso: string, long = false) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    month: long ? "long" : "short",
    day: "numeric",
    ...(long ? { weekday: "long" as const } : {}),
  }).format(new Date(iso));
export const eventTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
export const datePart = (iso: string, part: "day" | "month") =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    [part]: part === "day" ? "numeric" : "short",
  }).format(new Date(iso));
const escapeICS = (text: string) =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
function foldCalendarLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let segment = "";
  let bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) {
      parts.push(segment);
      segment = " ";
      bytes = 1;
    }
    segment += character;
    bytes += size;
  }
  parts.push(segment);
  return parts.join("\r\n");
}
export function calendarContent(event: CampusEvent): string {
  const stamp = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//CatCruxis//Campus Guide//EN",
      "BEGIN:VEVENT",
      `UID:cc-${event.id}@catcruxis.demo`,
      `DTSTAMP:${stamp(new Date().toISOString())}`,
      `DTSTART:${stamp(event.startDateTime)}`,
      `DTEND:${stamp(event.endDateTime || new Date(new Date(event.startDateTime).getTime() + 3600000).toISOString())}`,
      `SUMMARY:${escapeICS(event.title)} (demo event)`,
      `LOCATION:${escapeICS(event.location.name)}`,
      `DESCRIPTION:${escapeICS(event.description)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .map(foldCalendarLine)
      .join("\r\n") + "\r\n"
  );
}
export function downloadCalendar(event: CampusEvent) {
  const content = calendarContent(event);
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/calendar;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.slug}.ics`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
