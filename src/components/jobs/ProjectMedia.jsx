import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PiArrowSquareOut, PiImagesDuotone, PiLinkSimple, PiPlus, PiTrashDuotone, PiX } from "react-icons/pi";
import {
  collectJobImageEntries,
  collectJobImageUrls,
  collectJobLinkEntries,
  emptyJobLink,
  normalizeJobLinks,
  textToBulletItems,
} from "../../lib/jobMedia.js";

const BULLET_HINT = "One point per line. Prefix with •, -, or * (optional).";

/** Plain project overview — paragraphs only, never auto-bulleted. */
export function ProseRichText({ text, className = "" }) {
  if (!text || typeof text !== "string") return null;
  return (
    <p
      className={`whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400 ${className}`}
    >
      {text}
    </p>
  );
}

export function BulletRichText({ text, className = "" }) {
  const items = textToBulletItems(text);
  if (!items) {
    return <ProseRichText text={text} className={className} />;
  }
  return (
    <ul
      className={`list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600 marker:text-[#26b69c] dark:text-slate-400 ${className}`}
    >
      {items.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

export function BulletTextarea({ label, hint = BULLET_HINT, value, onChange, required, rows = 4, placeholder, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
      {hint ? (
        <p className="mt-1 text-[11px] leading-snug text-gray-500 dark:text-gray-500">{hint}</p>
      ) : null}
      <textarea
        required={required}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full resize-y rounded-xl bg-white border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-700 dark:bg-transparent"
      />
    </label>
  );
}

export function ImageGalleryModal({ open, title, urls, entries, onClose, onRemoveAt }) {
  const slides = useMemo(() => {
    if (entries?.length) return entries;
    return (urls || []).map((url, i) => ({ url, label: `Image ${i + 1}` }));
  }, [entries, urls]);

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!open) setActive(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const current = slides[active];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[110] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-gallery-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          onClick={onClose}
          aria-label="Close gallery"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative z-[111] flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <div className="min-w-0 pr-4">
              <h3 id="image-gallery-title" className="truncate text-sm font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              {current?.label ? (
                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{current.label}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <PiX size={22} />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <motion.div className="flex flex-1 items-center justify-center bg-slate-950/95 p-4">
              {current?.url ? (
                <img
                  src={current.url}
                  alt={current.label || ""}
                  className="max-h-[50vh] max-w-full rounded-lg object-contain md:max-h-[calc(90vh-8rem)]"
                />
              ) : (
                <p className="text-sm text-slate-400">No images</p>
              )}
            </motion.div>
            {slides.length > 1 ? (
              <div className="max-h-[40vh] shrink-0 overflow-y-auto border-t border-gray-100 p-3 dark:border-gray-800 md:max-h-none md:w-36 md:border-l md:border-t-0 lg:w-44">
                <div className="grid grid-cols-4 gap-2 md:grid-cols-1">
                  {slides.map((s, i) => (
                    <button
                      key={`${i}-${s.url.slice(0, 32)}`}
                      type="button"
                      onClick={() => setActive(i)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                        i === active
                          ? "border-[#26b69c] ring-2 ring-[#26b69c]/30"
                          : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img src={s.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {onRemoveAt ? (
            <div className="border-t border-gray-100 px-4 py-2 dark:border-gray-800">
              <button
                type="button"
                onClick={() => onRemoveAt(active)}
                className="text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400"
              >
                Remove current image
              </button>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function MultiImageUpload({
  inputId,
  label,
  hint = "PNG, JPG, or WebP. Up to 12 images.",
  urls,
  multiple = true,
  onFileChange,
  onClearAll,
  onOpenGallery,
}) {
  const has = urls.length > 0;
  return (
    <div className="w-full ">
      {/* <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span> */}
      <div className="mt-2 flex flex-wrap items-stretch gap-2">
        <label
          htmlFor={inputId}
          className="flex min-h-[120px] min-w-[200px] flex-1 cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/70 p-4 transition hover:border-[#26b69c] hover:bg-[#26b69c]/[0.06] dark:border-gray-700 dark:bg-black dark:hover:border-[#26b69c]/50"
        >
          <div className="relative h-16 w-16 shrink-0">
            {!has ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-gray-400 bg-white dark:border-gray-600 dark:bg-gray-800">
                <PiImagesDuotone size={30} className="text-gray-500 dark:text-gray-400" aria-hidden />
              </div>
            ) : (
              <>
                {urls.length > 1 ? (
                  <img
                    src={urls[1]}
                    alt=""
                    className="absolute left-0 top-1 h-12 w-12 rounded-lg border-2 border-white object-cover opacity-95 shadow-md dark:border-gray-900"
                    aria-hidden
                  />
                ) : null}
                <img
                  src={urls[0]}
                  alt=""
                  className="relative z-[1] h-16 w-16 rounded-full border border-gray-200 object-cover shadow-sm dark:border-gray-600"
                />
              </>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {has ? (multiple ? "Add more images" : "Change image") : multiple ? "Upload images" : "Upload image"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
          </div>
        </label>
        {has ? (
          <div className="flex w-[5.5rem] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50/90 px-2 py-3 dark:border-gray-700 dark:bg-gray-900/60">
            {urls.length > 1 ? (
              <span className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-[#26b69c] px-2.5 text-sm font-bold tabular-nums text-white shadow-md ring-2 ring-[#26b69c]/25">
                {urls.length}
              </span>
            ) : (
              <span className="h-9 w-9 shrink-0" aria-hidden />
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenGallery();
              }}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#26b69c]/35 bg-white text-[#26b69c] shadow-sm transition hover:bg-[#26b69c]/[0.08] dark:bg-transparent"
              aria-label="Preview images"
            >
              <PiImagesDuotone size={22} aria-hidden />
            </button>
            {onClearAll ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClearAll();
                }}
                className="text-[10px] font-bold uppercase tracking-wide text-red-600 dark:text-red-400"
              >
                Clear
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}

export function readFilesAsDataUrls(fileList) {
  const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => resolve("");
          reader.readAsDataURL(file);
        }),
    ),
  ).then((urls) => urls.filter(Boolean));
}

/** Titled external links — opens in a new tab. */
export function ProjectLinksList({ links, className = "", showScope = false }) {
  const items = links ?? [];
  if (!items.length) return null;
  return (
    <ul className={`flex flex-col gap-2 ${className}`} role="list">
      {items.map((link, i) => (
        <li key={`${link.scope ?? ""}-${link.title}-${i}`}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#156b59] shadow-sm transition hover:border-[#26b69c]/40 hover:bg-[#26b69c]/5 dark:border-gray-700 dark:bg-gray-900 dark:text-[#56d9c0] dark:hover:bg-[#26b69c]/10"
          >
            <PiLinkSimple size={16} className="shrink-0 text-[#26b69c]" aria-hidden />
            <span className="truncate">{link.title}</span>
            <PiArrowSquareOut
              size={14}
              className="shrink-0 opacity-60 transition group-hover:opacity-100"
              aria-hidden
            />
          </a>
          {showScope && link.scope ? (
            <p className="mt-1 pl-1 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {link.scope}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Milestone accordion body: description bullets + titled links. */
export function MilestoneDetailPanel({
  milestone,
  emptyText = "No milestone details.",
  className = "",
}) {
  const links = normalizeJobLinks(milestone?.links);
  const desc = milestone?.description;
  if (!desc && !links.length) {
    return <p className={`text-sm italic text-slate-500 dark:text-slate-500 ${className}`}>{emptyText}</p>;
  }
  return (
    <div className={`space-y-3 ${className}`}>
      {desc ? <BulletRichText text={desc} /> : null}
      {links.length ? <ProjectLinksList links={links} /> : null}
    </div>
  );
}

export function JobLinksEditor({
  label = "Reference links",
  hint = "Add a label and URL (Figma, repo, brief, etc.). Links open in a new tab.",
  links,
  onChange,
  max = 12,
  className = "",
}) {
  const rows = links?.length ? links : [emptyJobLink()];

  const update = (index, field, value) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const add = () => {
    if (rows.length >= max) return;
    onChange([...rows, emptyJobLink()]);
  };

  const remove = (index) => {
    const next = rows.filter((_, i) => i !== index);
    onChange(next.length ? next : [emptyJobLink()]);
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {label}
          </span>
          {hint ? (
            <p className="mt-1 text-[11px] leading-snug text-gray-500 dark:text-gray-500">{hint}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={add}
          disabled={rows.length >= max}
          className="flex justify-center items-center w-[120px] h-11 items-center gap-1 rounded-lg bg-[#26b69c]/10 px-3 py-1.5 text-xs font-bold text-[#156b59] disabled:opacity-40 dark:text-[#56d9c0]"
        >
          <PiPlus size={14} aria-hidden />
          Add link
        </button>
      </div>
      <ul className="mt-3 space-y-3">
        {rows.map((row, i) => (
          <li
            key={i}
            className="grid gap-2 rounded-xl border-gray-200  py-3 dark:border-gray-700 dark:bg-black sm:grid-cols-[1fr_1.4fr_auto]"
          >
            <label className="block min-w-0">
              <span className="text-[10px] font-bold uppercase text-gray-500">Title</span>
              <input
                value={row.title}
                onChange={(e) => update(i, "title", e.target.value)}
                placeholder="e.g. Figma mockups"
                className="mt-1 w-full h-12 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#26b69c] dark:border-gray-700 dark:bg-transparent"
              />
            </label>
            <label className="block min-w-0">
              <span className="text-[10px] font-bold uppercase text-gray-500">URL</span>
              <input
                value={row.url}
                onChange={(e) => update(i, "url", e.target.value)}
                placeholder="https://…"
                className="mt-1 w-full h-12 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#26b69c] dark:border-gray-700 dark:bg-transparent"
              />
            </label>
            <div className="flex items-center justify-center pt-6 sm:pb-0.5">
              <button
                type="button"
                onClick={() => remove(i)}
                className="flex items-center justify-center gap-1 rounded-lg w-11 h-11 border text-xs font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                aria-label="Remove link"
              >
                <PiTrashDuotone size={16} aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Images gallery trigger + link list for job detail headers. */
export function ProjectMediaBar({ job, title = "Project images", className = "" }) {
  const imageEntries = useMemo(() => collectJobImageEntries(job), [job]);
  const linkEntries = useMemo(() => collectJobLinkEntries(job), [job]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const closeGallery = useCallback(() => setGalleryOpen(false), []);

  if (!imageEntries.length && !linkEntries.length) return null;

  return (
    <div className={`flex w-full flex-col gap-3 ${className}`}>
      {imageEntries.length ? (
        <button
          type="button"
          onClick={() => setGalleryOpen(true)}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#26b69c]/35 bg-[#26b69c]/10 px-3 py-1.5 text-xs font-bold text-[#156b59] transition hover:bg-[#26b69c]/15 dark:text-[#56d9c0]"
        >
          <PiImagesDuotone size={16} aria-hidden />
          {imageEntries.length} image{imageEntries.length === 1 ? "" : "s"}
        </button>
      ) : null}
      <ProjectLinksList links={linkEntries} showScope={linkEntries.some((l) => l.scope && l.scope !== "Project")} />
      <ImageGalleryModal
        open={galleryOpen}
        title={title}
        entries={imageEntries}
        urls={collectJobImageUrls(job)}
        onClose={closeGallery}
      />
    </div>
  );
}

export function ProjectImagesButton({ job, title = "Project images", className = "" }) {
  return <ProjectMediaBar job={job} title={title} className={className} />;
}
