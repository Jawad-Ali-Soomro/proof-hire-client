import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  PiCaretDown,
  PiCaretLeft,
  PiCaretRight,
  PiCheck,
  PiImagesDuotone,
  PiPencilDuotone,
  PiTrashDuotone,
  PiUploadDuotone,
  PiUserDuotone,
  PiX,
} from "react-icons/pi";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest, apiUploadFile, getStoredToken } from "../lib/api.js";
import { HIRING_FOCUS_OPTIONS, SKILL_CATEGORIES, skillKey } from "../data/profileSetupOptions.js";
import DropdownSelect from "../components/ui/DropdownSelect.jsx";

const PROFILE_MAGIC = "PH_PROFILE_JSON::";

const STEPS = [
  { id: "personal", title: "Personal information", description: "Basic account details and address information." },
  { id: "academic", title: "Education", description: "Education details and certifications." },
  { id: "projects", title: "Projects", description: "Highlights with GitHub, blog, and project images (Pinata)." },
  { id: "portfolio", title: "Portfolio", description: "GitHub and LinkedIn links (no gallery here—use Projects for images)." },
  { id: "professional", title: "Professional", description: "Skills or hiring focus & services notes." },
];

const EDUCATION_SCHOOL_OPTIONS = [
  { value: "mit", label: "Massachusetts Institute of Technology" },
  { value: "stanford", label: "Stanford University" },
  { value: "harvard", label: "Harvard University" },
  { value: "oxford", label: "University of Oxford" },
  { value: "cambridge", label: "University of Cambridge" },
  { value: "other", label: "Other / Not listed" },
];

function parseCompositeBio(rawBio) {
  const src = (rawBio || "").trim();
  if (!src) {
    return {
      summary: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      educationTitle: "",
      educationSchool: "",
      educationDescription: "",
      educationYear: "",
      educationStartYear: "",
      educationEndYear: "",
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
        addressLine1: data.addressLine1 || "",
        addressLine2: data.addressLine2 || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "",
        postalCode: data.postalCode || "",
        educationTitle: data.educationTitle || "",
        educationSchool: data.educationSchool || "",
        educationDescription: data.educationDescription || "",
        educationYear: data.educationYear || "",
        educationStartYear: data.educationStartYear || "",
        educationEndYear: data.educationEndYear || "",
        educationEntries: Array.isArray(data.educationEntries) ? data.educationEntries : [],
        projectTitle: data.projectTitle || "",
        projectDescription: data.projectDescription || "",
        projectYear: data.projectYear || "",
        github: data.github || "",
        linkedin: data.linkedin || "",
        portfolioImages: Array.isArray(data.portfolioImages)
          ? data.portfolioImages
          : [],
      };
    } catch {
      // fallthrough to legacy parser
    }
  }

  if (!src.includes("[Summary]")) return { summary: src, academic: "", projects: "" };

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
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    educationTitle: "",
    educationSchool: "",
    educationDescription: read("Academic"),
    educationYear: "",
    educationStartYear: "",
    educationEndYear: "",
    educationEntries: [],
    projectTitle: "",
    projectDescription: read("Projects"),
    projectYear: "",
    github: "",
    linkedin: "",
    portfolioImages: [],
  };
}

/** Normalize education entry images from `images[]` or legacy `image` string. */
function educationEntryImages(entry) {
  if (!entry) return [];
  if (Array.isArray(entry.images) && entry.images.length) {
    return entry.images.map((u) => String(u).trim()).filter(Boolean);
  }
  const one = (entry.image || "").trim();
  return one ? [one] : [];
}

function ImageGalleryModal({ open, title, urls, onClose, onRemoveAt }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
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
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={onClose}
            aria-label="Close gallery"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative z-[101] max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <h3 id="image-gallery-title" className="pr-4 text-sm font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <PiX size={22} />
              </button>
            </div>
            <div className="max-h-[calc(85vh-3.5rem)] overflow-y-auto p-4">
              {urls.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {urls.map((src, i) => (
                    <div
                      key={`${i}-${src.slice(0, 40)}`}
                      className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      {onRemoveAt ? (
                        <button
                          type="button"
                          onClick={() => onRemoveAt(i)}
                          className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-white shadow-md transition hover:bg-black/85"
                          aria-label={`Remove image ${i + 1}`}
                        >
                          <PiX size={16} />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No images</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Matches personal-step avatar upload: dashed card, left preview, hint text; multi count + gallery when needed. */
function AvatarStyleMultiImageUpload({
  inputId,
  label,
  hint,
  urls,
  multiple,
  onFileChange,
  onClearAll,
  onOpenGallery,
}) {
  const has = urls.length > 0;
  return (
    <div className="w-full">
      <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
      <div className="mt-2 flex flex-wrap items-stretch gap-2">
        <label
          htmlFor={inputId}
          className="flex min-h-[130px] min-w-[200px] flex-1 cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/70 p-4 transition hover:border-[#26b69c] hover:bg-[#26b69c]/[0.06] dark:border-gray-700 dark:bg-gray-900/60 dark:hover:border-[#26b69c]/50"
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
            <AnimatePresence mode="wait">
              {urls.length > 1 ? (
                <motion.span
                  key={urls.length}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-[#26b69c] px-2.5 text-sm font-bold tabular-nums text-white shadow-md ring-2 ring-[#26b69c]/25"
                >
                  {urls.length}
                </motion.span>
              ) : (
                <span className="h-9 w-9 shrink-0" aria-hidden />
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenGallery();
              }}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#26b69c]/35 bg-white text-[#26b69c] shadow-sm transition hover:bg-[#26b69c]/[0.08] dark:bg-gray-800 dark:hover:bg-[#26b69c]/15"
              aria-label="View images in gallery"
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

async function uploadDataUrlIfNeeded(dataUrl, baseFilename, token) {
  const u = (dataUrl || "").trim();
  if (!u || !u.startsWith("data:")) return u;
  const resBlob = await fetch(u);
  const blob = await resBlob.blob();
  if (!blob.type.startsWith("image/")) return "";
  const ext =
    blob.type === "image/png"
      ? "png"
      : blob.type === "image/webp"
        ? "webp"
        : blob.type === "image/gif"
          ? "gif"
          : "jpg";
  const fd = new FormData();
  fd.append("file", blob, `${baseFilename}.${ext}`);
  const uploaded = await apiUploadFile("/profile/upload-image", fd, token);
  return typeof uploaded?.url === "string" ? uploaded.url : "";
}

function ToggleRow({ selected, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all dark:border-gray-600 ${
        selected
          ? "border-[#26b69c] bg-[#26b69c]/[0.06] ring-1 ring-[#26b69c]/20 dark:bg-[#26b69c]/10"
          : "border-gray-200 bg-white hover:border-gray-300 dark:hover:border-gray-700 dark:bg-transparent"
      }`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          selected
            ? "border-[#26b69c] bg-[#26b69c]"
            : "border-gray-300 bg-white dark:border-gray-800 dark:bg-gray-900 dark:bg-gray-900"
        }`}
      >
        {selected ? <PiCheck className="text-[15px] text-white" aria-hidden strokeWidth={3} /> : null}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
        {description ? (
          <span className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{description}</span>
        ) : null}
      </span>
    </button>
  );
}

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user, loading, applyAuthPayload } = useAuth();

  const [activeStep, setActiveStep] = useState("personal");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [summary, setSummary] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [educationTitle, setEducationTitle] = useState("");
  const [educationSchool, setEducationSchool] = useState("");
  const [educationDescription, setEducationDescription] = useState("");
  const [educationStartYear, setEducationStartYear] = useState("");
  const [educationEndYear, setEducationEndYear] = useState("");
  const [educationYear, setEducationYear] = useState("");
  const [educationEntries, setEducationEntries] = useState([]);
  const [editingEducationIndex, setEditingEducationIndex] = useState(-1);
  const [projectEntries, setProjectEntries] = useState([]);
  const [editingProjectIndex, setEditingProjectIndex] = useState(-1);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectYear, setProjectYear] = useState("");
  const [projectGithub, setProjectGithub] = useState("");
  const [projectBlog, setProjectBlog] = useState("");
  const [projectImages, setProjectImages] = useState([]);
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [educationImages, setEducationImages] = useState([]);
  const [avatar, setAvatar] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedHiringTags, setSelectedHiringTags] = useState([]);
  const [servicesNotes, setServicesNotes] = useState("");
  const [openSkillGroups, setOpenSkillGroups] = useState(() =>
    Object.fromEntries(SKILL_CATEGORIES.map((c) => [c.title, true])),
  );
  const [openFieldGroups, setOpenFieldGroups] = useState({ primary: true, notes: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageGallery, setImageGallery] = useState(null);

  const role = user?.role || "FREELANCER";

  useEffect(() => {
    if (!user) return;
    const p = user.profile || {};
    const legacy = parseCompositeBio(p.bio || "");

    const summaryVal = (p.summary ?? "").trim() || legacy.summary;
    setEmail(user.email || "");
    setFullName(p.fullName || "");
    setSummary(summaryVal);
    setAddressLine1((p.addressLine1 ?? "").trim() || legacy.addressLine1);
    setAddressLine2((p.addressLine2 ?? "").trim() || legacy.addressLine2);
    setCity((p.city ?? "").trim() || legacy.city);
    setStateRegion((p.state ?? "").trim() || legacy.state);
    setCountry((p.country ?? "").trim() || legacy.country);
    setPostalCode((p.postalCode ?? "").trim() || legacy.postalCode);
    setGithub((p.github ?? "").trim() || legacy.github);
    setLinkedin((p.linkedin ?? "").trim() || legacy.linkedin);

    const fromDbEducation = Array.isArray(p.educationEntries) ? p.educationEntries : null;
    if (fromDbEducation?.length) {
      setEducationEntries(
        fromDbEducation.map((entry) => ({
          title: (entry.title || "").trim(),
          school: (entry.school || "").trim(),
          startYear: (entry.startYear || "").trim(),
          endYear: (entry.endYear || "").trim(),
          year: (entry.year || "").trim(),
          description: (entry.description || "").trim(),
          images: educationEntryImages(entry),
        })),
      );
    } else if (
      legacy.educationEntries.length ||
      legacy.educationTitle ||
      legacy.educationSchool ||
      legacy.educationYear ||
      legacy.educationDescription
    ) {
      setEducationEntries(
        legacy.educationEntries.length
          ? legacy.educationEntries.map((e) => ({
              title: (e.title || "").trim(),
              school: (e.school || "").trim(),
              startYear: (e.startYear || "").trim(),
              endYear: (e.endYear || "").trim(),
              year: (e.year || "").trim(),
              description: (e.description || "").trim(),
              images: educationEntryImages(e),
            }))
          : [
              {
                title: legacy.educationTitle || "",
                school: legacy.educationSchool || "",
                startYear: legacy.educationStartYear || "",
                endYear: legacy.educationEndYear || legacy.educationYear || "",
                year: legacy.educationYear || "",
                description: legacy.educationDescription || "",
                images: [],
              },
            ],
      );
    } else {
      setEducationEntries([]);
    }
    resetEducationDraft();

    const fromDbProjects = Array.isArray(p.projects) ? p.projects : null;
    const legacyPortfolioImgs = Array.isArray(legacy.portfolioImages) ? legacy.portfolioImages : [];
    if (fromDbProjects?.length) {
      setProjectEntries(
        fromDbProjects.map((proj) => ({
          title: (proj.title || "").trim(),
          description: (proj.description || "").trim(),
          year: (proj.year || "").trim(),
          github: (proj.github || "").trim(),
          blog: (proj.blog || "").trim(),
          images: Array.isArray(proj.images) ? proj.images.map(String) : [],
        })),
      );
    } else if (legacy.projectTitle || legacy.projectDescription || legacy.projectYear || legacyPortfolioImgs.length) {
      setProjectEntries([
        {
          title: legacy.projectTitle || "",
          description: legacy.projectDescription || "",
          year: legacy.projectYear || "",
          github: "",
          blog: "",
          images: [...legacyPortfolioImgs],
        },
      ]);
    } else {
      setProjectEntries([]);
    }
    setEditingProjectIndex(-1);
    setProjectTitle("");
    setProjectDescription("");
    setProjectYear("");
    setProjectGithub("");
    setProjectBlog("");
    setProjectImages([]);

    setAvatar(p.avatar || "");
    setSelectedSkills(
      (p.skills || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    const rawServices = (p.services || "").trim();
    if (rawServices.includes("·")) {
      const [tagsPart, notesPart] = rawServices.split("·").map((s) => s.trim());
      setSelectedHiringTags(tagsPart.split(",").map((s) => s.trim()).filter(Boolean));
      setServicesNotes(notesPart || "");
    } else {
      const known = new Set(HIRING_FOCUS_OPTIONS.map((x) => x.title));
      const parts = rawServices.split(",").map((s) => s.trim()).filter(Boolean);
      setSelectedHiringTags(parts.filter((p2) => known.has(p2)));
      setServicesNotes(parts.filter((p2) => !known.has(p2)).join(", "));
    }
  }, [user]);

  const stepIndex = useMemo(() => STEPS.findIndex((s) => s.id === activeStep), [activeStep]);

  const toggleSkill = (skill) =>
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  const toggleHiringTag = (tag) =>
    setSelectedHiringTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:bg-gray-900">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  const toDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const url = await toDataUrl(file);
    setAvatar(String(url));
  };

  const onEducationImagesFileChange = async (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const urls = await Promise.all(files.map((f) => toDataUrl(f)));
    setEducationImages((prev) => [...prev, ...urls.map(String)]);
    e.target.value = "";
  };

  const onProjectImageFilesChange = async (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const urls = await Promise.all(files.map((f) => toDataUrl(f)));
    setProjectImages((prev) => [...prev, ...urls.map(String)]);
    e.target.value = "";
  };

  const resetProjectDraft = () => {
    setProjectTitle("");
    setProjectDescription("");
    setProjectYear("");
    setProjectGithub("");
    setProjectBlog("");
    setProjectImages([]);
    setEditingProjectIndex(-1);
  };

  const resetEducationDraft = () => {
    setEducationTitle("");
    setEducationSchool("");
    setEducationStartYear("");
    setEducationEndYear("");
    setEducationYear("");
    setEducationDescription("");
    setEducationImages([]);
    setEditingEducationIndex(-1);
  };

  const onUpsertEducation = () => {
    const imgs = educationImages.map(String).filter(Boolean);
    const draft = {
      title: educationTitle.trim(),
      school: educationSchool.trim(),
      startYear: educationStartYear.trim(),
      endYear: educationEndYear.trim(),
      year: educationYear.trim(),
      description: educationDescription.trim(),
      images: imgs,
    };
    if (
      !draft.title &&
      !draft.school &&
      !draft.startYear &&
      !draft.endYear &&
      !draft.year &&
      !draft.description &&
      !draft.images.length
    )
      return;
    if (editingEducationIndex >= 0) {
      setEducationEntries((prev) =>
        prev.map((entry, idx) => (idx === editingEducationIndex ? draft : entry)),
      );
      resetEducationDraft();
      return;
    }
    setEducationEntries((prev) => [...prev, draft]);
    resetEducationDraft();
  };

  const onEditEducation = (idx) => {
    const entry = educationEntries[idx];
    if (!entry) return;
    setEducationTitle(entry.title || "");
    setEducationSchool(entry.school || "");
    setEducationStartYear(entry.startYear || "");
    setEducationEndYear(entry.endYear || entry.year || "");
    setEducationYear(entry.endYear || entry.year || "");
    setEducationDescription(entry.description || "");
    setEducationImages(educationEntryImages(entry));
    setEditingEducationIndex(idx);
  };

  const onDeleteEducation = (idx) => {
    setEducationEntries((prev) => prev.filter((_, i) => i !== idx));
    if (editingEducationIndex === idx) resetEducationDraft();
    if (editingEducationIndex > idx) setEditingEducationIndex((prev) => prev - 1);
  };

  const onUpsertProject = () => {
    const draft = {
      title: projectTitle.trim(),
      description: projectDescription.trim(),
      year: projectYear.trim(),
      github: projectGithub.trim(),
      blog: projectBlog.trim(),
      images: projectImages.map(String),
    };
    if (
      !draft.title &&
      !draft.description &&
      !draft.year &&
      !draft.github &&
      !draft.blog &&
      !draft.images.length
    )
      return;
    if (editingProjectIndex >= 0) {
      setProjectEntries((prev) =>
        prev.map((entry, idx) => (idx === editingProjectIndex ? draft : entry)),
      );
      resetProjectDraft();
      return;
    }
    setProjectEntries((prev) => [...prev, draft]);
    resetProjectDraft();
  };

  const onEditProject = (idx) => {
    const entry = projectEntries[idx];
    if (!entry) return;
    setProjectTitle(entry.title || "");
    setProjectDescription(entry.description || "");
    setProjectYear(entry.year || "");
    setProjectGithub(entry.github || "");
    setProjectBlog(entry.blog || "");
    setProjectImages(Array.isArray(entry.images) ? [...entry.images] : []);
    setEditingProjectIndex(idx);
  };

  const onDeleteProject = (idx) => {
    setProjectEntries((prev) => prev.filter((_, i) => i !== idx));
    if (editingProjectIndex === idx) resetProjectDraft();
    if (editingProjectIndex > idx) setEditingProjectIndex((prev) => prev - 1);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setError("");
    if (role === "FREELANCER" && selectedSkills.length === 0) {
      setError("Select at least one skill.");
      return;
    }
    if (role === "CLIENT" && selectedHiringTags.length === 0 && !servicesNotes.trim()) {
      setError("Select hiring fields or add notes.");
      return;
    }
    setSaving(true);
    try {
      const token = getStoredToken();

      const normalizedEducationEntries = educationEntries
        .map((entry) => ({
          title: (entry.title || "").trim(),
          school: (entry.school || "").trim(),
          startYear: (entry.startYear || "").trim(),
          endYear: (entry.endYear || "").trim(),
          year: (entry.year || "").trim(),
          description: (entry.description || "").trim(),
          images: educationEntryImages(entry),
        }))
        .filter(
          (entry) =>
            entry.title ||
            entry.school ||
            entry.startYear ||
            entry.endYear ||
            entry.year ||
            entry.description ||
            entry.images.length,
        );

      const educationForApi = [];
      for (let i = 0; i < normalizedEducationEntries.length; i++) {
        const entry = normalizedEducationEntries[i];
        const uploadedImages = [];
        for (let j = 0; j < entry.images.length; j++) {
          const u = await uploadDataUrlIfNeeded(entry.images[j], `education-${i}-${j}`, token);
          if (u) uploadedImages.push(u);
        }
        const row = {
          title: entry.title,
          school: entry.school,
          startYear: entry.startYear,
          endYear: entry.endYear,
          year: entry.year,
          description: entry.description,
        };
        if (uploadedImages.length) row.images = uploadedImages;
        educationForApi.push(row);
      }

      const normalizedProjects = projectEntries
        .map((proj) => ({
          title: (proj.title || "").trim(),
          description: (proj.description || "").trim(),
          year: (proj.year || "").trim(),
          github: (proj.github || "").trim(),
          blog: (proj.blog || "").trim(),
          images: Array.isArray(proj.images) ? proj.images.map((u) => String(u).trim()).filter(Boolean) : [],
        }))
        .filter(
          (proj) =>
            proj.title ||
            proj.description ||
            proj.year ||
            proj.github ||
            proj.blog ||
            proj.images.length,
        );

      const projectsForApi = [];
      for (let i = 0; i < normalizedProjects.length; i++) {
        const proj = normalizedProjects[i];
        const uploadedImages = [];
        for (let j = 0; j < proj.images.length; j++) {
          const url = await uploadDataUrlIfNeeded(proj.images[j], `project-${i}-${j}`, token);
          if (url) uploadedImages.push(url);
        }
        projectsForApi.push({ ...proj, images: uploadedImages });
      }

      const servicesPayload = (() => {
        const tags = selectedHiringTags.join(", ");
        const notes = servicesNotes.trim();
        if (tags && notes) return `${tags} · ${notes}`;
        return tags || notes;
      })();

      let avatarUrl = (avatar || "").trim();
      if (avatarUrl.startsWith("data:")) {
        avatarUrl = await uploadDataUrlIfNeeded(avatarUrl, "avatar", token);
        if (!avatarUrl) throw new Error("Avatar upload failed");
      }

      const body = {
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        summary: summary.trim() || undefined,
        bio: summary.trim() || undefined,
        addressLine1: addressLine1.trim() || undefined,
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim() || undefined,
        state: stateRegion.trim() || undefined,
        country: country.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        github: github.trim() || undefined,
        educationEntries: educationForApi,
        projects: projectsForApi,
        avatar: avatarUrl || undefined,
        role,
        ...(role === "FREELANCER"
          ? { skills: selectedSkills.join(", ") }
          : { services: servicesPayload }),
      };
      const data = await apiRequest("/profile/complete", {
        method: "POST",
        token,
        body,
      });
      applyAuthPayload(data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSave} className="mx-auto p-6 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[350px_minmax(0,1fr)]">
        <aside className="rounded-2x h-fit lg:sticky lg:top-30 lg:z-10 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-wider text-[#26b69c]">Profile update</p>
          <ol className="mt-4 space-y-0">
            {STEPS.map((step, idx) => {
              const isActive = step.id === activeStep;
              const isDone = idx < stepIndex;
              const isLast = idx === STEPS.length - 1;
              return (
                <li key={step.id} className="relative flex gap-4">
                  <div className="flex w-11 shrink-0 flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      className={`relative z-[1] flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                        isDone
                          ? "border-[#26b69c] bg-[#26b69c] text-white"
                          : isActive
                            ? "border-[#26b69c] bg-white text-[#26b69c] dark:bg-gray-900"
                            : "border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-800/80"
                      }`}
                      aria-current={isActive ? "step" : undefined}
                    >
                      {isDone ? <PiCheck className="text-lg" strokeWidth={2.5} /> : <span>{idx + 1}</span>}
                    </button>
                    {!isLast ? (
                      <div
                        className={`mt-0 min-h-[3.25rem] w-0.5 flex-1 ${
                          isDone ? "bg-[#26b69c]" : "bg-gray-200 dark:bg-gray-600"
                        }`}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStep(step.id)}
                    className={`min-w-0 pb-8 text-left transition-opacity ${isLast ? "pb-0" : ""} ${
                      isActive ? "opacity-100" : isDone ? "opacity-90" : "opacity-55"
                    }`}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      Step {idx + 1} of {STEPS.length}
                    </p>
                    <h2
                      className={`mt-1 text-base font-bold leading-snug ${
                        isActive ? "text-[#26b69c] dark:text-white" : "text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {step.title}
                    </h2>
                    <p className="mt-1 capitalize text-sm line-clamp-1 font-semibold leading-relaxed text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <section>
          <p className="text-xs font-bold uppercase tracking-wider text-[#26b69c]">Profile</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white capitalize">Update your profile</h1>

          {activeStep === "personal" ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="grid grid-cols-1 md:grid-cols-2 col-span-2 gap-4">
              <div className="w-full">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Avatar</span>
                <label
                  htmlFor="avatar-upload"
                  className="mt-2 flex w-full h-[130px] cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/70 p-4 transition hover:border-[#26b69c] hover:bg-[#26b69c]/[0.06] dark:border-gray-700 dark:bg-gray-900/60"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile avatar"
                      className="h-16 w-16 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-gray-400 bg-white text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      <PiUserDuotone size={30} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {avatar ? "Change avatar" : "Upload avatar"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP</p>
                  </div>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={onAvatarFileChange}
                  className="hidden"
                />
              </div>
              <div className="flex flex-col">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-semibold outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-800"
                  required
                  disabled
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Full name</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-semibold outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                  required
                />
              </label>
              </div>
              </div>
            
              <label className="block md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Summary / bio</span>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Address line 1</span>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Address line 2</span>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">City</span>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">State / region</span>
                <input
                  type="text"
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Country</span>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Postal code</span>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                />
              </label>
            </div>
          ) : null}

          {activeStep === "academic" ? (
            <div className="mt-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Education title
                  </span>
                  <input
                    type="text"
                    value={educationTitle}
                    onChange={(e) => setEducationTitle(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    University / school
                  </span>
                  <DropdownSelect
                    value={educationSchool}
                    onChange={setEducationSchool}
                    options={EDUCATION_SCHOOL_OPTIONS}
                    placeholder="Select University / School"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Starting year
                  </span>
                  <input
                    type="text"
                    value={educationStartYear}
                    onChange={(e) => setEducationStartYear(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                    placeholder="e.g. 2022"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Ending year
                  </span>
                  <input
                    type="text"
                    value={educationEndYear}
                    onChange={(e) => {
                      setEducationEndYear(e.target.value);
                      setEducationYear(e.target.value);
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                    placeholder="e.g. 2026"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Education description
                  </span>
                  <textarea
                    value={educationDescription}
                    onChange={(e) => setEducationDescription(e.target.value)}
                    rows={6}
                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                  />
                </label>
                <div className="block md:col-span-2">
                  <AvatarStyleMultiImageUpload
                    inputId="education-images-upload"
                    label="Supporting images (optional)"
                    hint="PNG, JPG, WEBP — uploaded to Pinata when you save"
                    urls={educationImages}
                    multiple
                    onFileChange={onEducationImagesFileChange}
                    onClearAll={() => setEducationImages([])}
                    onOpenGallery={() =>
                      setImageGallery({
                        title: "Education — selected images",
                        urls: [...educationImages],
                        onRemoveAt: (removeIdx) => {
                          setEducationImages((prev) => prev.filter((_, j) => j !== removeIdx));
                          setImageGallery((g) =>
                            g ? { ...g, urls: g.urls.filter((_, j) => j !== removeIdx) } : null,
                          );
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="block mt-2">
                  
                  <button
                    type="button"
                    onClick={onUpsertEducation}
                    className="mt-2 w-full rounded-xl bg-[#26b69c] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105"
                  >
                    {editingEducationIndex >= 0 ? "Update Education" : "Add Education"}
                  </button>
                </div>
              <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-12 gap-1 bg-gray-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:bg-gray-900/70 dark:text-gray-400">
                  <span className="col-span-3">Title</span>
                  <span className="col-span-2">School</span>
                  <span className="col-span-2">Years</span>
                  <span className="col-span-2">Image</span>
                  <span className="col-span-3 text-right">Actions</span>
                </div>
                {educationEntries.length ? (
                  educationEntries.map((entry, idx) => {
                    const entryImgs = educationEntryImages(entry);
                    const first = entryImgs[0];
                    return (
                    <div
                      key={`${entry.title}-${entry.startYear || entry.year}-${first?.slice(0, 12) || ""}-${idx}`}
                      className="grid grid-cols-12 items-center gap-1 border-t border-gray-100 px-4 py-3 text-sm dark:border-gray-800"
                    >
                      <span className="col-span-3 truncate font-bold text-gray-800 dark:text-gray-200">
                        {entry.title || "-"}
                      </span>
                      <span className="col-span-2 font-semibold truncate text-gray-600 dark:text-gray-300">
                        {(EDUCATION_SCHOOL_OPTIONS.find((opt) => opt.value === entry.school)?.label ||
                          entry.school ||
                          "-")}
                      </span>
                      <span className="col-span-2 text-gray-600 font-semibold dark:text-gray-300">
                        {entry.startYear || entry.endYear
                          ? `${entry.startYear || "-"} - ${entry.endYear || "-"}`
                          : entry.year || "-"}
                      </span>
                      <span className="col-span-2 flex items-center gap-2">
                        {first ? (
                          <>
                            <img
                              src={first}
                              alt=""
                              className="h-12 w-12 shrink-0 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                            />
                            {entryImgs.length > 1 ? (
                              <motion.span
                                key={entryImgs.length}
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="rounded-full bg-[#26b69c] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm"
                              >
                                {entryImgs.length}
                              </motion.span>
                            ) : null}
                            <button
                              type="button"
                              onClick={() =>
                                setImageGallery({
                                  title: entry.title ? `${entry.title} — images` : "Education images",
                                  urls: entryImgs,
                                })
                              }
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#26b69c]/30 text-[#26b69c] transition hover:bg-[#26b69c]/[0.08] dark:hover:bg-[#26b69c]/15"
                              aria-label="View all education images"
                            >
                              <PiImagesDuotone size={18} aria-hidden />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </span>
                      <span className="col-span-3 justify-end flex gap-2">
                        <button
                          type="button"
                          onClick={() => onEditEducation(idx)}
                          className="rounded-lg border border-gray-300 w-10 h-10 flex items-center justify-center text-xs font-semibold text-gray-700 transition hover:border-[#26b69c] hover:text-[#26b69c] dark:border-gray-700 dark:text-gray-200"
                        >
                          <PiPencilDuotone size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteEducation(idx)}
                          className="rounded-lg border border-red-200 w-10 h-10 flex items-center justify-center text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <PiTrashDuotone size={15} />
                        </button>
                      </span>
                    </div>
                  );
                  })
                ) : (
                  <div className="border-t border-gray-100 px-4 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    No education entries added yet.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {activeStep === "projects" ? (
            <div className="mt-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Project title
                  </span>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Year</span>
                  <input
                    type="text"
                    value={projectYear}
                    onChange={(e) => setProjectYear(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Project description
                  </span>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={5}
                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Project GitHub
                  </span>
                  <input
                    type="url"
                    value={projectGithub}
                    onChange={(e) => setProjectGithub(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                    placeholder="https://github.com/org/repo"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Project blog / write-up
                  </span>
                  <input
                    type="url"
                    value={projectBlog}
                    onChange={(e) => setProjectBlog(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                    placeholder="https://"
                  />
                </label>
                <div className="block md:col-span-2">
                  <AvatarStyleMultiImageUpload
                    inputId="project-images-upload"
                    label="Project images"
                    hint="PNG, JPG, WEBP — uploaded to Pinata when you save"
                    urls={projectImages}
                    multiple
                    onFileChange={onProjectImageFilesChange}
                    onClearAll={() => setProjectImages([])}
                    onOpenGallery={() =>
                      setImageGallery({
                        title: "Project — selected images",
                        urls: [...projectImages],
                        onRemoveAt: (removeIdx) => {
                          setProjectImages((prev) => prev.filter((_, j) => j !== removeIdx));
                          setImageGallery((g) =>
                            g ? { ...g, urls: g.urls.filter((_, j) => j !== removeIdx) } : null,
                          );
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={onUpsertProject}
                  className="w-full rounded-xl bg-[#26b69c] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105"
                >
                  {editingProjectIndex >= 0 ? "Update project" : "Add project"}
                </button>
              </div>
              <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-12 gap-1 bg-gray-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:bg-gray-900/70 dark:text-gray-400">
                  <span className="col-span-3">Title</span>
                  <span className="col-span-2">Year</span>
                  <span className="col-span-2">Links</span>
                  <span className="col-span-2">Images</span>
                  <span className="col-span-3 text-right">Actions</span>
                </div>
                {projectEntries.length ? (
                  projectEntries.map((proj, idx) => {
                    const pImgs = Array.isArray(proj.images) ? proj.images.map(String).filter(Boolean) : [];
                    const pFirst = pImgs[0];
                    return (
                    <div
                      key={`${proj.title}-${proj.year}-${idx}`}
                      className="grid grid-cols-12 items-start gap-1 border-t border-gray-100 px-4 py-3 text-sm dark:border-gray-800"
                    >
                      <span className="col-span-3 font-bold text-gray-800 dark:text-gray-200">{proj.title || "—"}</span>
                      <span className="col-span-2 font-semibold text-gray-600 dark:text-gray-300">{proj.year || "—"}</span>
                      <span className="col-span-2 flex min-w-0 flex-col gap-0.5 text-xs font-semibold text-[#26b69c]">
                        {proj.github ? (
                          <a href={proj.github} target="_blank" rel="noreferrer" className="truncate underline">
                            GitHub
                          </a>
                        ) : null}
                        {proj.blog ? (
                          <a href={proj.blog} target="_blank" rel="noreferrer" className="truncate underline">
                            Blog
                          </a>
                        ) : null}
                        {!proj.github && !proj.blog ? <span className="text-gray-400">—</span> : null}
                      </span>
                      <span className="col-span-2 flex items-center gap-2">
                        {pFirst ? (
                          <>
                            <img
                              src={pFirst}
                              alt=""
                              className="h-12 w-12 shrink-0 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                            />
                            {pImgs.length > 1 ? (
                              <motion.span
                                key={pImgs.length}
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="rounded-full bg-[#26b69c] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm"
                              >
                                {pImgs.length}
                              </motion.span>
                            ) : null}
                            <button
                              type="button"
                              onClick={() =>
                                setImageGallery({
                                  title: proj.title ? `${proj.title} — images` : "Project images",
                                  urls: pImgs,
                                })
                              }
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#26b69c]/30 text-[#26b69c] transition hover:bg-[#26b69c]/[0.08] dark:hover:bg-[#26b69c]/15"
                              aria-label="View all project images"
                            >
                              <PiImagesDuotone size={18} aria-hidden />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </span>
                      <span className="col-span-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEditProject(idx)}
                          className="rounded-lg border border-gray-300 w-10 h-10 flex items-center justify-center text-gray-700 transition hover:border-[#26b69c] hover:text-[#26b69c] dark:border-gray-700 dark:text-gray-200"
                        >
                          <PiPencilDuotone size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProject(idx)}
                          className="rounded-lg border border-red-200 w-10 h-10 flex items-center justify-center text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <PiTrashDuotone size={15} />
                        </button>
                      </span>
                    </div>
                  );
                  })
                ) : (
                  <div className="border-t border-gray-100 px-4 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    No projects yet. Add one above.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {activeStep === "portfolio" ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Github link
                </span>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                  placeholder="https://github.com/username"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Linkedin link
                </span>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                  placeholder="https://linkedin.com/in/username"
                />
              </label>
              <p className="md:col-span-2 text-sm text-gray-500 dark:text-gray-400">
                Project screenshots and media belong under the Projects step; they are stored on Pinata and saved with each project.
              </p>
            </div>
          ) : null}

          {activeStep === "professional" ? (
            role === "FREELANCER" ? (
              <div className="mt-6 space-y-3">
                {SKILL_CATEGORIES.map((category) => {
                  const isOpen = openSkillGroups[category.title];
                  return (
                    <div key={category.title} className="rounded-xl border border-gray-200/80 dark:border-gray-800 p-3">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenSkillGroups((prev) => ({
                            ...prev,
                            [category.title]: !prev[category.title],
                          }))
                        }
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left"
                      >
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {category.title}
                        </span>
                        {isOpen ? <PiCaretDown /> : <PiCaretRight />}
                      </button>
                      {isOpen ? (
                        <div className="grid gap-2 px-3 mt-3 pb-3 sm:grid-cols-2">
                          {category.skills.map((entry) => {
                            const key = skillKey(entry);
                            const selected = selectedSkills.includes(key);
                            return (
                              <ToggleRow
                                key={key}
                                selected={selected}
                                title={key}
                                description={typeof entry === "string" ? "" : entry.description}
                                onClick={() => toggleSkill(key)}
                              />
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 space-y-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800 dark:bg-gray-900">
                <div className="rounded-xl border border-gray-200/80 dark:border-gray-800 dark:bg-gray-900">
                  <button
                    type="button"
                    onClick={() => setOpenFieldGroups((p) => ({ ...p, primary: !p.primary }))}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left"
                  >
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Primary fields
                    </span>
                    {openFieldGroups.primary ? <PiCaretDown /> : <PiCaretRight />}
                  </button>
                  {openFieldGroups.primary ? (
                    <div className="grid gap-2 px-3 pb-3 sm:grid-cols-2">
                      {HIRING_FOCUS_OPTIONS.map((item) => {
                        const selected = selectedHiringTags.includes(item.title);
                        return (
                          <ToggleRow
                            key={item.title}
                            selected={selected}
                            title={item.title}
                            description={item.description}
                            onClick={() => toggleHiringTag(item.title)}
                          />
                        );
                      })}
                    </div>
                  ) : null}
                </div>
                <div className="rounded-xl border border-gray-200/80 dark:border-gray-800 dark:bg-gray-900">
                  <button
                    type="button"
                    onClick={() => setOpenFieldGroups((p) => ({ ...p, notes: !p.notes }))}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left"
                  >
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Notes (optional)
                    </span>
                    {openFieldGroups.notes ? <PiCaretDown /> : <PiCaretRight />}
                  </button>
                  {openFieldGroups.notes ? (
                    <div className="px-3 pb-3">
                      <textarea
                        value={servicesNotes}
                        onChange={(e) => setServicesNotes(e.target.value)}
                        rows={3}
                        className="mt-1 w-full resize-none rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                        placeholder="Additional hiring details..."
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            )
          ) : null}

          {error ? (
            <p className="mt-5 text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={() => setActiveStep(STEPS[Math.max(0, stepIndex - 1)].id)}
              disabled={stepIndex === 0}
              className="rounded-full border border-gray-300 w-12 h-12 flex items-center justify-center text-sm font-bold text-gray-800 disabled:opacity-40 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
            >
              <PiCaretLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(STEPS[Math.min(STEPS.length - 1, stepIndex + 1)].id)}
              disabled={stepIndex === STEPS.length - 1}
              className="rounded-full border border-[#26b69c]/40 bg-[#26b69c]/10 w-12 h-12 flex items-center justify-center text-sm font-bold text-[#26b69c] disabled:opacity-40"
            >
              <PiCaretRight size={20} />
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#26b69c] w-50 h-12 flex items-center justify-center gap-2 text-sm font-bold text-white disabled:opacity-60"
            >
              <PiUploadDuotone size={20} />
              Save Details
            </button>
          </div>
        </section>
      </div>
      <ImageGalleryModal
        open={imageGallery != null}
        title={imageGallery?.title ?? ""}
        urls={imageGallery?.urls ?? []}
        onClose={() => setImageGallery(null)}
        onRemoveAt={imageGallery?.onRemoveAt}
      />
    </form>
  );
}

