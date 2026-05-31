function parseMilestones(raw) {
  if (!Array.isArray(raw)) return [];
  return raw;
}

export function normalizeImageUrls(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((u) => String(u).trim()).filter(Boolean);
}

/** @typedef {{ title: string, url: string, scope?: string }} JobLinkEntry */

/**
 * @param {unknown} raw
 * @returns {{ title: string, url: string }[]}
 */
export function normalizeJobLinks(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const title = String(item.title ?? "").trim();
    let url = String(item.url ?? "").trim();
    if (!title || !url) continue;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      new URL(url);
    } catch {
      continue;
    }
    out.push({ title, url });
  }
  return out;
}

/**
 * Project + milestone links with display scope labels.
 * @param {object | null | undefined} job
 * @returns {JobLinkEntry[]}
 */
export function collectJobLinkEntries(job) {
  if (!job) return [];
  const entries = [];
  normalizeJobLinks(job.links).forEach((link) => {
    entries.push({ ...link, scope: "Project" });
  });
  parseMilestones(job.milestones).forEach((m, i) => {
    const milestoneTitle = typeof m?.title === "string" ? m.title.trim() : "";
    const scope = milestoneTitle || `Milestone ${i + 1}`;
    normalizeJobLinks(m?.links).forEach((link) => {
      entries.push({ ...link, scope });
    });
  });
  return entries;
}

/** Flat URL list for gallery modal */
export function collectJobImageUrls(job) {
  return collectJobImageEntries(job).map((e) => e.url);
}

/** URLs with labels (project + milestone refs) */
export function collectJobImageEntries(job) {
  if (!job) return [];
  const entries = [];
  normalizeImageUrls(job.images).forEach((url, i) => {
    entries.push({ url, label: `Project image ${i + 1}` });
  });
  parseMilestones(job.milestones).forEach((m, i) => {
    const title = typeof m?.title === "string" ? m.title.trim() : "";
    normalizeImageUrls(m?.images).forEach((url, j) => {
      entries.push({
        url,
        label: title ? `${title} — image ${j + 1}` : `Milestone ${i + 1} — image ${j + 1}`,
      });
    });
  });
  return entries;
}

const BULLET_PREFIX = /^[\s]*(?:[-*•]|\d+[.)])\s+/;

export function textToBulletItems(text) {
  if (!text || typeof text !== "string") return null;
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return null;
  const strip = (l) => l.replace(BULLET_PREFIX, "").trim();
  if (lines.some((l) => BULLET_PREFIX.test(l))) {
    return lines.map(strip);
  }
  return null;
}

export const emptyJobLink = () => ({ title: "", url: "" });

const emptyMilestoneForm = () => ({
  title: "",
  description: "",
  amount: "",
  dueDate: "",
  images: [],
  links: [emptyJobLink()],
});

/** Map API job → post/edit form state. */
export function jobToProjectFormState(job) {
  if (!job) return null;
  const ms = parseMilestones(job.milestones);
  const milestones =
    ms.length > 0
      ? ms.map((m) => {
          const links = normalizeJobLinks(m?.links);
          return {
            title: typeof m?.title === "string" ? m.title : "",
            description: typeof m?.description === "string" ? m.description : "",
            amount: m?.amount != null && m.amount !== "" ? String(m.amount) : "",
            dueDate: typeof m?.dueDate === "string" ? m.dueDate : "",
            images: normalizeImageUrls(m?.images),
            links: links.length ? links : [emptyJobLink()],
          };
        })
      : [emptyMilestoneForm()];
  const projectLinks = normalizeJobLinks(job.links);
  return {
    title: job.title ?? "",
    description: job.description ?? "",
    budget: job.budget != null ? String(job.budget) : "",
    requirements: job.requirements ?? "",
    paymentNotes: job.paymentNotes ?? "",
    projectImages: normalizeImageUrls(job.images),
    projectLinks: projectLinks.length ? projectLinks : [emptyJobLink()],
    milestones,
  };
}

/** Rows from the post form → API payload (title + url only). */
export function packJobLinks(rows) {
  if (!Array.isArray(rows)) return [];
  return normalizeJobLinks(
    rows
      .map((r) => ({
        title: String(r?.title ?? "").trim(),
        url: String(r?.url ?? "").trim(),
      }))
      .filter((r) => r.title && r.url),
  );
}
