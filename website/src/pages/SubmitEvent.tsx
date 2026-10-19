import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, Check, ImagePlus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "../data/categories";
import { sources } from "../data/sources";
import { useEvents } from "../lib/EventContext";
import { campusDateTime } from "../lib/format";
import type { CampusEvent } from "../data/types";
export function SubmitEvent() {
  const { submitEvent } = useEvents();
  const [image, setImage] = useState("");
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<CampusEvent | null>(null);
  const upload = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const values = new FormData(e.currentTarget);
    const title = String(values.get("title")).trim();
    const description = String(values.get("description")).trim();
    const organizer = String(values.get("organizer")).trim();
    const location = String(values.get("location")).trim();
    const date = String(values.get("date"));
    const start = String(values.get("start"));
    const end = String(values.get("end"));
    if (!title || !description || !organizer || !location) {
      setError("Please fill in each required field with more than spaces.");
      return;
    }
    if (end && end <= start) {
      setError("End time must be later than the start time.");
      form.current?.querySelector<HTMLInputElement>('[name="end"]')?.focus();
      return;
    }
    const selected = values.getAll("categories").map(String);
    if (!selected.length) {
      setError("Choose at least one category so people can find your event.");
      return;
    }
    const status =
      values.get("status") === "official" ? "official" : "student-organized";
    const url = String(values.get("url") || "").trim();
    if (url && !/^https?:\/\//i.test(url)) {
      setError("Original event URL must start with https:// or http://.");
      return;
    }
    setBusy(true);
    try {
      const event = await submitEvent({
        slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        title,
        description: `${description}\n\nThis is a locally submitted demo event for the CatCruxis prototype. It is not a published campus announcement.`,
        shortDescription:
          description.length > 125
            ? description.slice(0, 122) + "…"
            : description,
        startDateTime: campusDateTime(date, start),
        endDateTime: end ? campusDateTime(date, end) : undefined,
        location: { id: Date.now(), name: location },
        organizers: [
          {
            id: Date.now(),
            name: organizer,
            type:
              status === "official" ? "Campus organizer" : "Student community",
          },
        ],
        categories: categories.filter((c) => selected.includes(c.slug)),
        sources: [{ ...sources[4], ...(url ? { url } : { url: undefined }) }],
        officialStatus: status,
        image: image || "/images/workshop.jpg",
        imageAlt: image
          ? `Submitted image for ${title}`
          : "People collaborating around a table",
        featured: false,
      });
      setSuccess(event);
    } catch {
      setError("We couldn’t add your event. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if (success)
    return (
      <section className="section success-page">
        <span className="success-icon">
          <Check size={40} />
        </span>
        <span className="eyebrow red-text">
          Good plans deserve good company
        </span>
        <h1>
          You’re on
          <br />
          the lineup<span className="red-text">.</span>
        </h1>
        <p>
          <strong>{success.title}</strong> is now part of this demo’s event
          guide.
        </p>
        <p className="muted">
          Your event stays in this session. Refreshing resets the prototype.
        </p>
        <div className="success-actions">
          <Link className="button red" to={`/events/${success.id}`}>
            See your event <ArrowUpRight size={17} />
          </Link>
          <button
            className="button outline"
            onClick={() => {
              setSuccess(null);
              setImage("");
              setFilename("");
            }}
          >
            Submit another
          </button>
        </div>
      </section>
    );
  return (
    <section className="section submit-page">
      <div className="submit-intro">
        <span className="eyebrow red-text">Open invitation</span>
        <h1>
          Make a plan.
          <br />
          Let campus
          <br />
          <span className="red-text">in on it.</span>
        </h1>
        <p>
          Big event or small gathering. If it brings people together, it belongs
          here.
        </p>
        <div className="submit-aside-note">
          <span className="eyebrow">A quick heads up</span>
          <p>
            This is a frontend demo. Your submission will appear in the guide
            for this session only.
          </p>
          <p>All dates and times are in Davidson’s Eastern Time.</p>
        </div>
      </div>
      <form ref={form} className="event-form" onSubmit={submit}>
        <div className="form-heading">
          <h2>The details.</h2>
          <span>* Required</span>
        </div>
        <label>
          Event title *
          <input
            name="title"
            required
            maxLength={120}
            placeholder="Give your event a name"
          />
        </label>
        <label>
          Description *
          <textarea
            name="description"
            required
            maxLength={4000}
            rows={5}
            placeholder="What’s happening? What should people know?"
          />
        </label>
        <div className="form-row">
          <label>
            Date *
            <input name="date" type="date" required defaultValue="2026-10-16" />
          </label>
          <label>
            Start time *<input name="start" type="time" required />
          </label>
          <label>
            End time
            <input name="end" type="time" />
          </label>
        </div>
        <label>
          Location *
          <input
            name="location"
            required
            maxLength={160}
            placeholder="A building, a room, or your favorite spot"
          />
        </label>
        <label>
          Organizer *
          <input
            name="organizer"
            required
            maxLength={160}
            placeholder="Your name, group, or organization"
          />
        </label>
        <fieldset className="category-options">
          <legend>
            Categories * <span>Choose all that fit</span>
          </legend>
          {categories.map((c) => (
            <label key={c.id}>
              <input type="checkbox" name="categories" value={c.slug} />
              <span>{c.name}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className="status-options">
          <legend>Who’s organizing? *</legend>
          <label>
            <input
              type="radio"
              name="status"
              value="student-organized"
              defaultChecked
            />
            <span>
              Student-organized
              <small>Friends, clubs, and campus communities</small>
            </span>
          </label>
          <label>
            <input type="radio" name="status" value="official" />
            <span>
              Official event<small>Departments and campus offices</small>
            </span>
          </label>
        </fieldset>
        <div className="upload-field">
          <label htmlFor="event-image">
            Event image <span>Optional</span>
          </label>
          <input
            ref={upload}
            id="event-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (
                !["image/jpeg", "image/png", "image/webp"].includes(
                  file.type,
                ) ||
                file.size > 5 * 1024 * 1024
              ) {
                setError("Choose a JPG, PNG, or WebP image under 5 MB.");
                e.target.value = "";
                return;
              }
              setError("");
              const reader = new FileReader();
              reader.onload = () => {
                setImage(String(reader.result));
                setFilename(file.name);
              };
              reader.onerror = () =>
                setError("That image couldn’t be read. Try another file.");
              reader.readAsDataURL(file);
            }}
          />
          {image ? (
            <div className="upload-preview">
              <img src={image} alt="Event image preview" />
              <span>{filename}</span>
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => {
                  setImage("");
                  setFilename("");
                  if (upload.current) upload.current.value = "";
                }}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              className="upload-button"
              type="button"
              onClick={() => upload.current?.click()}
            >
              <ImagePlus size={26} />
              <strong>Add a little atmosphere</strong>
              <span>JPG, PNG, or WebP · up to 5 MB</span>
            </button>
          )}
        </div>
        <label>
          Original event URL <span>Optional</span>
          <input name="url" type="url" placeholder="https://" />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-submit">
          <span>
            No account needed.
            <br />
            Just good plans.
          </span>
          <button className="button red" type="submit" disabled={busy}>
            {busy ? "Adding your event…" : "Submit Event"}
            <ArrowUpRight size={18} />
          </button>
        </div>
      </form>
    </section>
  );
}
