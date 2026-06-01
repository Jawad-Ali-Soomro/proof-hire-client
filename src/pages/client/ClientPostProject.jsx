import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PiCaretLeft, PiPlus, PiTrashDuotone } from "react-icons/pi";
import { apiRequest, getStoredToken } from "../../lib/api.js";
import { uploadImageList } from "../../lib/uploadImage.js";
import {
  BulletTextarea,
  ImageGalleryModal,
  JobLinksEditor,
  MultiImageUpload,
  readFilesAsDataUrls,
} from "../../components/jobs/ProjectMedia.jsx";
import { emptyJobLink, jobToProjectFormState, packJobLinks } from "../../lib/jobMedia.js";
import ClientOnly from "./ClientOnly.jsx";

const MAX_IMAGES = 12;

const emptyMilestone = () => ({
  title: "",
  description: "",
  amount: "",
  dueDate: "",
  images: [],
  links: [emptyJobLink()],
});

async function buildProjectBody({
  title,
  description,
  budget,
  requirements,
  paymentNotes,
  projectImages,
  projectLinks,
  milestones,
  token,
}) {
  const uploadedProjectImages = await uploadImageList(
    projectImages,
    `job-${Date.now()}`,
    token,
  );

  const milestonePayload = [];
  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i];
    const t = m.title.trim();
    if (!t) continue;
    const images = await uploadImageList(m.images, `job-ms-${i + 1}-${Date.now()}`, token);
    const msLinks = packJobLinks(m.links);
    milestonePayload.push({
      title: t,
      description: m.description.trim(),
      dueDate: m.dueDate.trim(),
      amount: m.amount === "" ? undefined : Number(m.amount),
      ...(images.length ? { images } : {}),
      ...(msLinks.length ? { links: msLinks } : {}),
    });
  }

  const links = packJobLinks(projectLinks);
  return {
    title: title.trim(),
    description: description.trim(),
    budget: Number(budget),
    requirements: requirements.trim() || undefined,
    paymentNotes: paymentNotes.trim() || undefined,
    images: uploadedProjectImages,
    links,
    milestones: milestonePayload,
  };
}

export default function ClientPostProject() {
  const { jobId: editJobId } = useParams();
  const isEdit = Boolean(editJobId);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [requirements, setRequirements] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [projectImages, setProjectImages] = useState([]);
  const [projectLinks, setProjectLinks] = useState([emptyJobLink()]);
  const [milestones, setMilestones] = useState([emptyMilestone()]);
  const [loadingJob, setLoadingJob] = useState(isEdit);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [gallery, setGallery] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setLoadingJob(true);
    setLoadError("");
    void apiRequest(`/jobs/${editJobId}`, { token: getStoredToken() })
      .then((job) => {
        if (cancelled) return;
        if (job.status !== "OPEN") {
          setLoadError("This project can no longer be edited. Only open listings are editable.");
          return;
        }
        const form = jobToProjectFormState(job);
        if (!form) return;
        setTitle(form.title);
        setDescription(form.description);
        setBudget(form.budget);
        setRequirements(form.requirements);
        setPaymentNotes(form.paymentNotes);
        setProjectImages(form.projectImages);
        setProjectLinks(form.projectLinks);
        setMilestones(form.milestones);
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Could not load project");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingJob(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editJobId, isEdit]);

  const addMilestone = () => setMilestones((prev) => [...prev, emptyMilestone()]);
  const removeMilestone = (idx) =>
    setMilestones((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));

  const updateMilestone = (idx, field, value) => {
    setMilestones((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    );
  };

  const appendImages = useCallback((setter, max, files) => {
    void readFilesAsDataUrls(files).then((added) => {
      setter((prev) => [...prev, ...added].slice(0, max));
    });
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const token = getStoredToken();
      const body = await buildProjectBody({
        title,
        description,
        budget,
        requirements,
        paymentNotes,
        projectImages,
        projectLinks,
        milestones,
        token,
      });

      if (isEdit) {
        await apiRequest(`/jobs/${editJobId}`, {
          method: "PATCH",
          token,
          body,
        });
        navigate(`/dashboard/client/projects/${editJobId}`, { replace: true });
      } else {
        await apiRequest("/jobs", {
          method: "POST",
          token,
          body: {
            ...body,
            ...(body.images.length ? { images: body.images } : {}),
            ...(body.links.length ? { links: body.links } : {}),
            milestones: body.milestones.length ? body.milestones : undefined,
          },
        });
        navigate("/dashboard/client/projects", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : isEdit ? "Could not save project" : "Could not post project");
    } finally {
      setSubmitting(false);
    }
  };

  const formDisabled = loadingJob || Boolean(loadError);

  return (
    <ClientOnly>
      <div className="mx-auto">
        {isEdit ? (
          <Link
            to={`/dashboard/client/projects/${editJobId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#26b69c] transition hover:underline"
          >
            <PiCaretLeft size={18} aria-hidden />
            Back to project
          </Link>
        ) : null}
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#26b69c]">Client</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? "Edit project" : "Post a project"}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {isEdit
            ? "Update your listing while it is still open. Changes apply only to this project you posted."
            : "Add a project overview, reference images and links, milestones, and payment notes. Freelancers bid from the marketplace; you manage applicants under Track projects."}
        </p>

        {loadingJob ? (
          <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">Loading project…</p>
        ) : loadError ? (
          <p className="mt-8 text-sm font-semibold text-red-600 dark:text-red-400">{loadError}</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-8">
            <section className="border-b icon py-6 border-gray-200 dark:border-gray-700">
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-1">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Project title
                  </span>
                  <input
                    required
                    disabled={formDisabled}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. React dashboard + API integration"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-semibold outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-transparent disabled:opacity-60"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Total budget (USDT)
                  </span>
                  <input
                    required
                    disabled={formDisabled}
                    type="number"
                    min="1"
                    step="0.01"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-semibold outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-transparent disabled:opacity-60"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Payment & invoicing notes
                  </span>
                  <textarea
                    rows={3}
                    disabled={formDisabled}
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g. 50% upfront, net-15, milestone releases…"
                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-transparent disabled:opacity-60"
                  />
                </label>
              </div>
            </section>

            <section className="border-b icon py-6 border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Scope & visuals</h2>
              <div className="mt-4 grid gap-5 lg:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Overview & deliverables
                  </span>
                  <p className="mt-1 text-[11px] leading-snug text-gray-500 dark:text-gray-500">
                    Write a clear description in plain text. Line breaks are preserved.
                  </p>
                  <textarea
                    required
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the project goals, scope, and what you need delivered…"
                    className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-700 dark:bg-transparent"
                  />
                </label>
                <BulletTextarea
                  label="Requirements & constraints"
                  rows={6}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder={"• React 18 + TypeScript\n• WCAG AA\n• Deploy to Vercel"}
                />
              </div>
              <div className="mt-5 space-y-6">
                <MultiImageUpload
                  inputId="project-cover-images"
                  label="Project reference images"
                  hint="Screenshots, mockups, or briefs. Up to 12 images."
                  urls={projectImages}
                  onFileChange={(e) => {
                    appendImages(setProjectImages, MAX_IMAGES, e.target.files);
                    e.target.value = "";
                  }}
                  onClearAll={() => setProjectImages([])}
                  onOpenGallery={() =>
                    setGallery({
                      title: "Project images",
                      urls: projectImages,
                      onRemoveAt: (i) => setProjectImages((prev) => prev.filter((_, j) => j !== i)),
                    })
                  }
                />
                <JobLinksEditor
                  label="Project reference links"
                  links={projectLinks}
                  onChange={setProjectLinks}
                />
              </div>
            </section>

            <section className="border-b py-6 border-gray-200 icon dark:border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Milestones</h2>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-[#26b69c]/40 bg-[#26b69c]/10 px-4 text-xs font-bold text-[#156b59] dark:text-[#56d9c0]"
                >
                  <PiPlus size={16} aria-hidden />
                  Add milestone
                </button>
              </div>
              <div
                className={`mt-4 grid gap-4 ${milestones.length > 1 ? "md:grid-cols-2" : "grid-cols-1"}`}
              >
                {milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl py-4 dark:border-gray-700 dark:bg-black"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#26b69c]">
                      Milestone {idx + 1}
                    </p>
                    <div className="mt-3 grid gap-3">
                      <label className="block">
                        <span className="text-[11px] font-bold uppercase text-gray-500">Title</span>
                        <input
                          value={m.title}
                          onChange={(e) => updateMilestone(idx, "title", e.target.value)}
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-700 dark:bg-transparent"
                        />
                      </label>
                      <BulletTextarea
                        label="Description"
                        rows={3}
                        value={m.description}
                        onChange={(e) => updateMilestone(idx, "description", e.target.value)}
                        placeholder={"• Deliverable A\n• Deliverable B"}
                        className="!mt-0"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-[11px] font-bold uppercase text-gray-500">
                            Amount (optional)
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={m.amount}
                            onChange={(e) => updateMilestone(idx, "amount", e.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-700 dark:bg-transparent"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-bold uppercase text-gray-500">Target date</span>
                          <input
                            type="text"
                            value={m.dueDate}
                            onChange={(e) => updateMilestone(idx, "dueDate", e.target.value)}
                            placeholder="e.g. 2026-07-01"
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-700 dark:bg-transparent"
                          />
                        </label>
                      </div>
                      <JobLinksEditor
                        label="Milestone links"
                        hint="Optional Figma, docs, or repo links for this phase."
                        links={m.links}
                        onChange={(next) => updateMilestone(idx, "links", next)}
                        max={8}
                      />
                      <MultiImageUpload
                        inputId={`milestone-images-${idx}`}
                        label="Milestone images"
                        hint="Optional visuals for this phase."
                        urls={m.images}
                        onFileChange={(e) => {
                          void readFilesAsDataUrls(e.target.files).then((added) => {
                            updateMilestone(idx, "images", [...m.images, ...added].slice(0, MAX_IMAGES));
                          });
                          e.target.value = "";
                        }}
                        onClearAll={() => updateMilestone(idx, "images", [])}
                        onOpenGallery={() =>
                          setGallery({
                            title: m.title.trim() || `Milestone ${idx + 1}`,
                            urls: m.images,
                            onRemoveAt: (i) =>
                              updateMilestone(
                                idx,
                                "images",
                                m.images.filter((_, j) => j !== i),
                              ),
                          })
                        }
                      />
                    </div>
                    {milestones.length > 1 ? (
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeMilestone(idx)}
                          className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold text-white"
                        >
                          <PiTrashDuotone size={16} aria-hidden />
                          Remove
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            {error ? (
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting || formDisabled}
              className="w-full rounded-xl bg-[#26b69c] py-3.5 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-60"
            >
              {submitting
                ? isEdit
                  ? "Saving…"
                  : "Publishing…"
                : isEdit
                  ? "Save changes"
                  : "Publish Project"}
            </button>
          </form>
        )}

        <ImageGalleryModal
          open={gallery != null}
          title={gallery?.title ?? ""}
          urls={gallery?.urls ?? []}
          onClose={() => setGallery(null)}
          onRemoveAt={gallery?.onRemoveAt}
        />
      </div>
    </ClientOnly>
  );
}
