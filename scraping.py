"""
Download CatCruxis event sources into data/raw 
"""
import re
from urllib.parse import urljoin
from datetime import datetime
from bs4 import BeautifulSoup, Comment


import json
import sys
from pathlib import Path
from xml.etree import ElementTree

import requests


RAW_DIR = Path(__file__).resolve().parent / "data" / "raw"

WILDCATSYNC_URL = "https://wildcatsync.davidson.edu/events.rss"

DAVIDSON_EVENTS_URL = "https://www.davidson.edu/events"

HURT_HUB_URL = (
    "https://hurthub.davidson.edu/wp-json/tribe/events/v1/events"
)

TIMEOUT = 30


TIME_RE = re.compile(
    r"(\d{1,2}:\d{2}\s*[AP]M)(?:\s*[-–]\s*(\d{1,2}:\d{2}\s*[AP]M))?",
    re.I,
)
MONTH_DAY_RE = re.compile(r"^[A-Z][a-z]+ \d{1,2}\b")


def clean(text):
    return " ".join(text.split())


def to_iso(date_text, time_text):
    """Combine 'November 04, 2026' and '5:00PM' into an ISO string."""
    try:
        return datetime.strptime(
            f"{date_text} {time_text.replace(' ', '').upper()}",
            "%B %d, %Y %I:%M%p",
        ).isoformat()
    except (TypeError, ValueError):
        return None


def parse_davidson_detail(html, url, listing_date):
    soup = BeautifulSoup(html, "html.parser")

    h1 = soup.find("h1")
    if h1 is None:
        raise ValueError("event page has no <h1>")

    # Visible text between the title and the footer, in page order.
    lines = []
    for node in h1.find_all_next(string=True):
        if isinstance(node, Comment) or node.find_parent(["script", "style"]):
            continue
        text = clean(node)
        if node.find_parent("footer") or text == "Visit the homepage":
            break
        if text:
            lines.append(text)

    # "Date/Time" label, followed by a month-day line and a time line.
    date_time_lines = []
    if "Date/Time" in lines:
        for line in lines[lines.index("Date/Time") + 1:]:
            if MONTH_DAY_RE.match(line) or TIME_RE.search(line):
                date_time_lines.append(line)
            else:
                break
    date_time_text = " ".join(date_time_lines) or None

    match = TIME_RE.search(date_time_text or "")
    start = to_iso(listing_date, match.group(1)) if match else None
    end = (
        to_iso(listing_date, match.group(2))
        if match and match.group(2)
        else None
    )

    # "Location" label, followed by the location line.
    location = None
    if "Location" in lines:
        index = lines.index("Location") + 1
        if index < len(lines):
            location = lines[index]

    # Description paragraphs and any links inside them.
    container = soup.find("main") or soup
    paragraphs = []
    links = []
    for p in container.find_all("p"):
        if p.find_parent(["footer", "nav", "header"]):
            continue
        text = clean(p.get_text())
        if not text or text in (location, date_time_text):
            continue
        paragraphs.append(text)
        for a in p.find_all("a", href=True):
            links.append(
                {
                    "text": clean(a.get_text()),
                    "url": urljoin(url, a["href"]),
                }
            )

    def meta(name):
        tag = soup.find("meta", attrs={"property": name}) or soup.find(
            "meta", attrs={"name": name}
        )
        return tag.get("content") if tag else None

    return {
        "date_time_text": date_time_text,
        "start": start,  # naive local time (Davidson is America/New_York)
        "end": end,
        "location": location,
        "description": "\n\n".join(paragraphs) or None,
        "links": links,
        "image": meta("og:image"),
        "updated": meta("og:updated_time"),
    }


def download_davidson_detail(session, event):
    response = session.get(event["url"], timeout=TIMEOUT)
    response.raise_for_status()

    return parse_davidson_detail(response.text, event["url"], event["when"])

def save_bytes(path, content):
    """Replace an existing file only after its replacement is written."""
    temporary = path.with_suffix(path.suffix + ".tmp")

    try:
        temporary.write_bytes(content)
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)


def download_rss(session, url, filename, source, verify=True):
    """Download, validate, and save an RSS feed."""
    response = session.get(url, timeout=TIMEOUT, verify=verify)
    response.raise_for_status()

    # Reject HTML login/error pages even if the server returns HTTP 200.
    root = ElementTree.fromstring(response.content)

    if root.tag.rsplit("}", 1)[-1] != "rss":
        raise ValueError(
            f"{source} returned XML that is not an RSS feed"
        )

    path = RAW_DIR / filename
    save_bytes(path, response.content)

    print(f"Saved {source} RSS to {path}")


def download_wildcatsync(session):
    download_rss(
        session,
        WILDCATSYNC_URL,
        "wildcatsync.xml",
        "WildcatSync",
    )

DATE_RE = re.compile(
    r"[A-Z][a-z]+ \d{2}, \d{4}"
    r"(?: \d{1,2}:\d{2} [AP]M(?: - \d{1,2}:\d{2} [AP]M)?)?"
)
TOTAL_RE = re.compile(r"Displaying\s+\d+\s*-\s*\d+\s+of\s+(\d+)")


def parse_davidson_page(html):
    """Return (events, reported_total) for one listing page."""
    soup = BeautifulSoup(html, "html.parser")

    match = TOTAL_RE.search(soup.get_text(" ", strip=True))
    total = int(match.group(1)) if match else None

    events = []
    for link in soup.select("h3 a[href]"):
        url = urljoin(DAVIDSON_EVENTS_URL, link["href"])
        if not url.startswith(DAVIDSON_EVENTS_URL + "/"):
            continue

        # The date text appears just before each event title.
        date_node = link.find_previous(string=DATE_RE)
        when = DATE_RE.search(date_node).group(0) if date_node else None

        events.append(
            {"title": link.get_text(strip=True), "url": url, "when": when}
        )

    return events, total


def download_davidson_events(session):
    events = []
    seen = set()
    total = None

    for page in range(50):  # hard cap so a bad response can't loop forever
        response = session.get(
            DAVIDSON_EVENTS_URL, params={"page": page}, timeout=TIMEOUT
        )
        response.raise_for_status()

        batch, page_total = parse_davidson_page(response.text)
        total = total or page_total

        new = [e for e in batch if e["url"] not in seen]
        if not new:
            break

        seen.update(e["url"] for e in new)
        events.extend(new)
        print(f"Fetched Davidson events page {page}: {len(new)} events")

        if total is not None and len(events) >= total:
            break


    if not events:
        raise ValueError("Davidson events page contained no events")


    failures = 0

    for number, event in enumerate(events, 1):
        try:
            event.update(download_davidson_detail(session, event))
        except (requests.RequestException, ValueError, OSError) as exc:
            event["detail_error"] = str(exc)
            failures += 1
            print(f"Detail failed for {event['url']}: {exc}", file=sys.stderr)

        print(f"Fetched details {number}/{len(events)}")

    if failures:
        print(f"{failures} detail pages failed", file=sys.stderr)

    if total is not None and len(events) != total:
        print(
            f"Warning: page reports {total} events, parsed {len(events)}",
            file=sys.stderr,
        )

    content = json.dumps(
        {"events": events, "total": len(events)},
        ensure_ascii=False,
        indent=2,
    ).encode("utf-8")

    path = RAW_DIR / "davidson.json"
    save_bytes(path, content + b"\n")

    print(f"Saved {len(events)} Davidson events to {path}")



def download_hurt_hub(session):
    events = []
    page = 1

    while True:
        response = session.get(
            HURT_HUB_URL,
            params={
                "per_page": 50,
                "page": page,
                # Request historical events as well as upcoming events.
                "start_date": "2026-01-01 00:00:00",
            },
            timeout=TIMEOUT,
        )
        response.raise_for_status()

        # Raises ValueError if the response contains invalid JSON.
        payload = response.json()

        if not isinstance(payload, dict) or not isinstance(
            payload.get("events"), list
        ):
            raise ValueError(
                f"Unexpected Hurt Hub response on page {page}"
            )

        batch = payload["events"]
        total_pages = payload.get("total_pages")

        if total_pages is not None and (
            type(total_pages) is not int or total_pages < 0
        ):
            raise ValueError(
                f"Invalid Hurt Hub total_pages on page {page}"
            )

        if not batch:
            if total_pages is not None and page <= total_pages:
                raise ValueError(
                    f"Hurt Hub returned an unexpectedly empty page {page}"
                )
            break

        events.extend(batch)
        print(f"Fetched Hurt Hub page {page}: {len(batch)} events")

        if total_pages is not None and page >= total_pages:
            break

        page += 1

    # Preserve every event field, including nested venues and organizers.
    content = json.dumps(
        {"events": events, "total": len(events)},
        ensure_ascii=False,
        indent=2,
        allow_nan=False,
    ).encode("utf-8")

    path = RAW_DIR / "hurthub.json"
    save_bytes(path, content + b"\n")

    print(f"Saved {len(events)} Hurt Hub events to {path}")


def main():
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    failed = False

    with requests.Session() as session:
        session.headers.update(
            {"User-Agent": "CatCruxis event extractor/1.0"}
        )

        # A failure in one source does not prevent downloading the others.
        for download in (
            download_wildcatsync,
            download_davidson_events,
            download_hurt_hub,
        ):
            try:
                download(session)
            except (
                requests.RequestException,
                ValueError,
                TypeError,
                OSError,
                ElementTree.ParseError,
            ) as exc:
                print(
                    f"{download.__name__} failed: {exc}",
                    file=sys.stderr,
                )
                failed = True

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())