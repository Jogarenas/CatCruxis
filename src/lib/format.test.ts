import { describe, expect, it } from "vitest";
import { campusDateTime, campusDay, calendarContent } from "./format";
import { mockEvents } from "../data/events";
describe("Davidson dates and calendar export", () => {
  it("converts entered campus time correctly in summer and winter", () => {
    expect(campusDateTime("2026-10-16", "18:00")).toBe(
      "2026-10-16T22:00:00.000Z",
    );
    expect(campusDateTime("2026-12-16", "18:00")).toBe(
      "2026-12-16T23:00:00.000Z",
    );
    expect(campusDay(campusDateTime("2026-10-16", "23:00"))).toBe("2026-10-16");
  });
  it("exports UTC dates, escapes text, and folds long UTF-8 lines", () => {
    const content = calendarContent({
      ...mockEvents[0],
      title: "Coffee, code; campus",
      description: "A line\nAnother line with café ☕ ".repeat(10),
    });
    const unfolded = content.replace(/\r\n /g, "");
    expect(content.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(unfolded).toContain("DTSTART:20261013T220000Z");
    expect(unfolded).toContain("SUMMARY:Coffee\\, code\\; campus (demo event)");
    expect(unfolded).toContain("DESCRIPTION:A line\\nAnother line");
    expect(content.endsWith("END:VCALENDAR\r\n")).toBe(true);
    for (const line of content.split("\r\n"))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
});
