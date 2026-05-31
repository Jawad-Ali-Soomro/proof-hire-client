const PROFILE_MAGIC = "PH_PROFILE_JSON::";

export function strTrim(v) {
  return v == null ? "" : String(v).trim();
}

export function educationEntryImages(entry) {
  if (!entry) return [];
  if (Array.isArray(entry.images) && entry.images.length) {
    return entry.images.map((u) => strTrim(u)).filter(Boolean);
  }
  const one = strTrim(entry?.image);
  return one ? [one] : [];
}

function parseCompositeBio(rawBio) {
  const src = strTrim(rawBio);
  if (!src) {
    return {
      summary: "",
      educationEntries: [],
      projectTitle: "",
      projectDescription: "",
      projectYear: "",
      github: "",
      linkedin: "",
      portfolioImages: [],
    };
  }

  if (src.startsWith(PROFILE_MAGIC)) {
    try {
      const data = JSON.parse(src.slice(PROFILE_MAGIC.length));
      return {
        summary: data.summary || "",
        educationEntries: Array.isArray(data.educationEntries) ? data.educationEntries : [],
        projectTitle: data.projectTitle || "",
        projectDescription: data.projectDescription || "",
        projectYear: data.projectYear || "",
        github: data.github || "",
        linkedin: data.linkedin || "",
        portfolioImages: Array.isArray(data.portfolioImages) ? data.portfolioImages : [],
      };
    } catch {
      // fall through
    }
  }

  if (!src.includes("[Summary]")) {
    return { summary: src, educationEntries: [], projectTitle: "", projectDescription: "", projectYear: "", github: "", linkedin: "", portfolioImages: [] };
  }

  const read = (label) => {
    const start = src.indexOf(`[${label}]`);
    if (start < 0) return "";
    const from = start + label.length + 2;
    const next = ["Summary", "Academic", "Projects"]
      .filter((x) => x !== label)
      .map((x) => src.indexOf(`[${x}]`, from))
      .filter((i) => i >= 0);
    const end = next.length ? Math.min(...next) : src.length;
    return src.slice(from, end).trim();
  };

  return {
    summary: read("Summary"),
    educationEntries: [],
    projectTitle: "",
    projectDescription: read("Projects"),
    projectYear: "",
    github: "",
    linkedin: "",
    portfolioImages: [],
  };
}

function normalizeEducationEntry(entry) {
  return {
    title: strTrim(entry?.title),
    school: strTrim(entry?.school),
    startYear: strTrim(entry?.startYear),
    endYear: strTrim(entry?.endYear),
    year: strTrim(entry?.year),
    description: strTrim(entry?.description),
    images: educationEntryImages(entry),
  };
}

function normalizeProjectEntry(proj) {
  return {
    title: strTrim(proj?.title),
    description: strTrim(proj?.description),
    year: strTrim(proj?.year),
    github: strTrim(proj?.github),
    blog: strTrim(proj?.blog),
    images: Array.isArray(proj?.images) ? proj.images.map((u) => strTrim(u)).filter(Boolean) : [],
  };
}

/** Normalize API profile + legacy bio into view-model for public profile tabs. */
export function normalizePublicProfile(profile) {
  if (!profile) {
    return {
      summary: "",
      bio: "",
      skills: [],
      services: "",
      linkedin: "",
      github: "",
      location: "",
      education: [],
      projects: [],
      docs: [],
    };
  }

  const legacy = parseCompositeBio(profile.bio || "");
  const summary = strTrim(profile.summary) || legacy.summary;
  const bio = strTrim(profile.bio);
  const linkedin = strTrim(profile.linkedin) || legacy.linkedin;
  const github = strTrim(profile.github) || legacy.github;
  const services = strTrim(profile.services);

  const locationParts = [profile.city, profile.state, profile.country].map((x) => strTrim(x)).filter(Boolean);
  const location = locationParts.join(", ");

  let education = [];
  if (Array.isArray(profile.educationEntries) && profile.educationEntries.length) {
    education = profile.educationEntries.map(normalizeEducationEntry).filter(hasEducationContent);
  } else if (legacy.educationEntries?.length) {
    education = legacy.educationEntries.map(normalizeEducationEntry).filter(hasEducationContent);
  }

  let projects = [];
  if (Array.isArray(profile.projects) && profile.projects.length) {
    projects = profile.projects.map(normalizeProjectEntry).filter(hasProjectContent);
  } else if (legacy.projectTitle || legacy.projectDescription || legacy.projectYear || legacy.portfolioImages?.length) {
    projects = [
      normalizeProjectEntry({
        title: legacy.projectTitle,
        description: legacy.projectDescription,
        year: legacy.projectYear,
        images: legacy.portfolioImages,
      }),
    ].filter(hasProjectContent);
  }

  const skills = strTrim(profile.skills)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const docs = [];
  education.forEach((entry) => {
    const label = entry.title || entry.school || "Education";
    entry.images.forEach((url, i) => {
      docs.push({
        url,
        label: entry.images.length > 1 ? `${label} (${i + 1})` : label,
        kind: "education",
      });
    });
  });
  projects.forEach((proj) => {
    const label = proj.title || "Project";
    proj.images.forEach((url, i) => {
      docs.push({
        url,
        label: proj.images.length > 1 ? `${label} (${i + 1})` : label,
        kind: "project",
      });
    });
  });

  return {
    summary,
    bio: bio && bio !== summary ? bio : "",
    skills,
    services,
    linkedin,
    github,
    location,
    education,
    projects,
    docs,
  };
}

function hasEducationContent(entry) {
  return Boolean(
    entry.title ||
      entry.school ||
      entry.startYear ||
      entry.endYear ||
      entry.year ||
      entry.description ||
      entry.images.length,
  );
}

function hasProjectContent(proj) {
  return Boolean(
    proj.title || proj.description || proj.year || proj.github || proj.blog || proj.images.length,
  );
}

export function isPdfUrl(url) {
  return /\.pdf(\?|$)/i.test(strTrim(url));
}
