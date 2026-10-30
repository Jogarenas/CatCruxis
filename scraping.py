"""Download CatCruxis event sources into data/raw beside this script.

Install the dependency with: python3 -m pip install requests
Run with: python3 extract_events.py
"""

import json
import sys
from pathlib import Path
from xml.etree import ElementTree

import requests


RAW_DIR = Path(__file__).resolve().parent / "data" / "raw"

WILDCATSYNC_URL = "https://wildcatsync.davidson.edu/events.rss"

DAVIDSON_URL = (
    "https://ems.davidson.edu/MasterCalendarAnon/RSSFeeds.aspx"
    "?data=rWVImWG4wi1iC5u2UcXAOQhPGcS%2FMgl3flFEe8bYg1M%3D"
)

HURT_HUB_URL = (
    "https://hurthub.davidson.edu/wp-json/tribe/events/v1/events"
)

TIMEOUT = 30


def save_bytes(path, content):
    """Replace an existing file only after its replacement is written."""
    temporary = path.with_suffix(path.suffix + ".tmp")

    try:
        temporary.write_bytes(content)
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)


def download_rss(session, url, filename, source):
    """Download, validate, and save an RSS feed."""
    response = session.get(url, timeout=TIMEOUT)
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


def download_davidson_events(session):
    download_rss(
        session,
        DAVIDSON_URL,
        "davidson.xml",
        "Davidson events",
    )


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
                "start_date": "1970-01-01 00:00:00",
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