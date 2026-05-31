import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  PiArrowLeft,
  PiChatCircleDotsDuotone,
  PiPaperPlaneRight,
} from "react-icons/pi";
import { useAuth } from "../context/AuthContext.jsx";
import { useChatSocket } from "../context/ChatSocketContext.jsx";
import { apiRequest, getStoredToken } from "../lib/api.js";

function displayName(user) {
  return user?.fullName?.trim() || user?.username || "User";
}

function Avatar({ user, size = "md" }) {
  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "chat"
        ? "h-9 w-9 text-xs shrink-0"
        : "h-10 w-10 text-sm";
  const round = size === "chat" ? "rounded-full" : "rounded-xl";
  const url = user?.avatar?.trim();
  const label = displayName(user);
  if (url) {
    return (
      <img
        src={url}
        alt={label}
        title={label}
        className={`${sizeClass} ${round} object-cover ring-2 ring-white dark:ring-gray-900`}
      />
    );
  }
  return (
    <div
      title={label}
      className={`${sizeClass} ${round} flex items-center justify-center bg-gradient-to-br from-[#26b69c] to-emerald-600 font-bold text-white ring-2 ring-white dark:ring-gray-900`}
      aria-label={label}
    >
      {label.slice(0, 1).toUpperCase()}
    </div>
  );
}

function resolveContractFromMention(text, contracts) {
  const atIdx = text.lastIndexOf("@");
  if (atIdx < 0) return { contractId: null, title: text };
  const afterAt = text.slice(atIdx + 1);
  const sorted = [...contracts].sort((a, b) => b.jobTitle.length - a.jobTitle.length);
  for (const c of sorted) {
    if (afterAt.toLowerCase().startsWith(c.jobTitle.toLowerCase())) {
      const title = `${text.slice(0, atIdx)}${text.slice(atIdx + 1 + c.jobTitle.length)}`.trim();
      return { contractId: c.id, title };
    }
  }
  return { contractId: null, title: text };
}

function parseComposer(draft, activeContracts) {
  const trimmed = draft.trim();
  if (!trimmed.startsWith("#")) {
    return { kind: "message", content: trimmed };
  }
  let body = trimmed.slice(1).trim();
  const { contractId, title } = resolveContractFromMention(body, activeContracts);
  return { kind: "task", title: title.trim(), contractId };
}

export default function MessagesPage() {
  const { userId: userIdParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connected, setActiveConversationId, subscribe } = useChatSocket();

  const [threads, setThreads] = useState([]);
  const [room, setRoom] = useState(null);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [draft, setDraft] = useState("");
  const [taskContractId, setTaskContractId] = useState("");
  const [projectPicker, setProjectPicker] = useState({ open: false, query: "", start: -1 });
  const [sending, setSending] = useState(false);
  const [taskBusy, setTaskBusy] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const selectedUserId = userIdParam ? Number(userIdParam) : null;

  const activeContracts = useMemo(
    () =>
      (room?.sharedContracts ?? []).filter((c) => c.status !== "TERMINATED"),
    [room?.sharedContracts],
  );

  const isTaskDraft = draft.trimStart().startsWith("#");

  const filteredProjects = useMemo(() => {
    if (!projectPicker.open) return [];
    const q = projectPicker.query.trim().toLowerCase();
    if (!q) return activeContracts;
    return activeContracts.filter((c) => c.jobTitle.toLowerCase().includes(q));
  }, [projectPicker.open, projectPicker.query, activeContracts]);

  const selectedProjectLabel = useMemo(() => {
    const id = taskContractId ? Number(taskContractId) : room?.defaultContractId;
    if (!id) return null;
    return activeContracts.find((c) => c.id === id)?.jobTitle ?? null;
  }, [taskContractId, room?.defaultContractId, activeContracts]);

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    try {
      const list = await apiRequest("/chat/threads", { token: getStoredToken() });
      setThreads(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load conversations");
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  const loadRoom = useCallback(
    async (otherUserId) => {
      if (!otherUserId) return;
      setLoadingRoom(true);
      setError("");
      try {
        const data = await apiRequest(`/chat/users/${otherUserId}`, {
          token: getStoredToken(),
        });
        setRoom(data);
        setActiveConversationId(data.conversationId);
        const active = (data.sharedContracts ?? []).filter(
          (c) => c.status !== "TERMINATED",
        );
        const defaultId =
          data.defaultContractId != null
            ? String(data.defaultContractId)
            : active.length === 1
              ? String(active[0].id)
              : "";
        setTaskContractId(defaultId);
      } catch (e) {
        setRoom(null);
        setActiveConversationId(null);
        setError(e instanceof Error ? e.message : "Could not load chat");
      } finally {
        setLoadingRoom(false);
      }
    },
    [setActiveConversationId],
  );

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (selectedUserId && Number.isFinite(selectedUserId)) {
      void loadRoom(selectedUserId);
    } else {
      setRoom(null);
      setActiveConversationId(null);
    }
  }, [selectedUserId, loadRoom, setActiveConversationId]);

  useEffect(() => {
    return subscribe("message", (msg) => {
      if (!room || msg.conversationId !== room.conversationId) return;
      setRoom((prev) => {
        if (!prev || prev.messages.some((m) => m.id === msg.id)) return prev;
        return { ...prev, messages: [...prev.messages, msg] };
      });
    });
  }, [subscribe, room?.conversationId]);

  useEffect(() => {
    return subscribe("task", () => {
      void loadThreads();
    });
  }, [subscribe, loadThreads]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room?.messages?.length]);

  const selectThread = (counterpartyId) => {
    navigate(`/dashboard/messages/${counterpartyId}`);
  };

  const handleDraftChange = (e) => {
    const value = e.target.value;
    const pos = e.target.selectionStart ?? value.length;
    setDraft(value);

    const before = value.slice(0, pos);
    const atMatch = before.match(/@([^@\n]*)$/);
    if (atMatch && activeContracts.length > 0) {
      setProjectPicker({
        open: true,
        query: atMatch[1],
        start: pos - atMatch[0].length,
      });
    } else {
      setProjectPicker({ open: false, query: "", start: -1 });
    }
  };

  const insertProjectMention = (contract) => {
    const start = projectPicker.start >= 0 ? projectPicker.start : draft.lastIndexOf("@");
    const end = inputRef.current?.selectionStart ?? draft.length;
    const next = `${draft.slice(0, start)}@${contract.jobTitle} ${draft.slice(end)}`;
    setDraft(next);
    setTaskContractId(String(contract.id));
    setProjectPicker({ open: false, query: "", start: -1 });
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      const caret = start + contract.jobTitle.length + 2;
      inputRef.current?.setSelectionRange(caret, caret);
    });
  };

  const createTask = async (title, contractIdFromMention) => {
    if (!title || !room) return;
    let contractId =
      contractIdFromMention ??
      (taskContractId ? Number(taskContractId) : null) ??
      room.defaultContractId ??
      null;
    if (!contractId && activeContracts.length === 1) {
      contractId = activeContracts[0].id;
    }
    if (!contractId && activeContracts.length > 1) {
      setError("Type @ and pick a project for this task");
      return;
    }
    setTaskBusy(true);
    setError("");
    try {
      const res = await apiRequest(`/chat/users/${room.counterparty.id}/tasks`, {
        method: "POST",
        token: getStoredToken(),
        body: { title, contractId },
      });
      setDraft("");
      setTaskContractId(
        activeContracts.length === 1 ? String(activeContracts[0].id) : taskContractId,
      );
      setProjectPicker({ open: false, query: "", start: -1 });
      setRoom((prev) => {
        if (!prev) return prev;
        const messages = prev.messages.some((m) => m.id === res.message.id)
          ? prev.messages
          : [...prev.messages, res.message];
        return { ...prev, messages };
      });
      void loadThreads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task");
    } finally {
      setTaskBusy(false);
    }
  };

  const sendMessage = async (content) => {
    if (!content || !room) return;
    setSending(true);
    try {
      const msg = await apiRequest(
        `/chat/users/${room.counterparty.id}/messages`,
        {
          method: "POST",
          token: getStoredToken(),
          body: { content },
        },
      );
      setDraft("");
      setProjectPicker({ open: false, query: "", start: -1 });
      setRoom((prev) => {
        if (!prev || prev.messages.some((m) => m.id === msg.id)) return prev;
        return { ...prev, messages: [...prev.messages, msg] };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !room) return;
    const parsed = parseComposer(draft, activeContracts);
    if (parsed.kind === "task") {
      if (!parsed.title) {
        setError("Add a task title after #");
        return;
      }
      await createTask(parsed.title, parsed.contractId);
      return;
    }
    await sendMessage(parsed.content);
  };

  const handleComposerKeyDown = (e) => {
    if (e.key === "Escape") {
      setProjectPicker({ open: false, query: "", start: -1 });
      return;
    }
    if (!projectPicker.open || !filteredProjects.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
      e.preventDefault();
      if (e.key === "Enter") {
        insertProjectMention(filteredProjects[0]);
      }
    }
  };

  const busy = sending || taskBusy;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden ">
      {error ? (
        <p className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col h-full lg:flex-row">
        <aside className="flex w-full p-2 flex-col mr-10 border-b border-slate-200 dark:border-gray-800 lg:w-70 lg:border-b-0 lg:border-r">
          <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            People
          </p>
          <ul className="flex-1 overflow-y-auto">
            {loadingThreads ? (
              <li className="px-4 py-6 text-sm text-slate-500">Loading…</li>
            ) : !threads.length ? (
              <li className="px-4 py-6 text-sm text-slate-500">
                No conversations yet. Message someone after you start a project together.
              </li>
            ) : (
              threads.map((t) => {
                const active = selectedUserId === t.counterpartyId;
                return (
                  <li key={t.conversationId}>
                    <button
                      type="button"
                      onClick={() => selectThread(t.counterpartyId)}
                      className={`flex w-full gap-3 rounded-[10px] px-4 py-3 text-left transition ${
                        active
                          ? "bg-[#26b69c]/10 dark:bg-[#26b69c]/15"
                          : "hover:bg-slate-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <Avatar user={t.counterparty} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {displayName(t.counterparty)}
                        </p>
                        {t.lastMessage ? (
                          <p className="mt-0.5 truncate text-[11px] text-slate-400">
                            {t.lastMessage.content}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-[11px] text-slate-400">No messages yet</p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          {!selectedUserId ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <PiChatCircleDotsDuotone className="text-slate-300" size={48} />
              <p className="mt-3 font-semibold text-slate-700 dark:text-slate-300">
                Select a conversation
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Send a normal message, or start with <span className="font-semibold">#</span> to
                create a task. Type <span className="font-semibold">@</span> to attach a project.
              </p>
            </div>
          ) : loadingRoom ? (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
              Loading chat…
            </div>
          ) : room ? (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-gray-800">
                <button
                  type="button"
                  className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  onClick={() => navigate("/dashboard/messages")}
                  aria-label="Back"
                >
                  <PiArrowLeft size={20} />
                </button>
                <Avatar user={room.counterparty} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">
                    {displayName(room.counterparty)}
                  </p>
                </div>
              </div>

              {activeContracts.length > 0 ? (
                <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-2 dark:border-gray-800">
                  {activeContracts.map((c) => (
                    <Link
                      key={c.id}
                      to="/dashboard/contracts"
                      state={{ openContractId: c.id }}
                      className="rounded-lg bg-slate-100 px-5 py-3 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-gray-800 dark:text-slate-300"
                    >
                      {c.jobTitle}
                    </Link>
                  ))}
                </div>
              ) : null}

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {room.messages.map((m) => {
                  const mine = m.senderId === user?.id;
                  const isTask = m.type === "TASK";
                  return (
                    <div
                      key={m.id}
                      className={`flex items-end gap-2.5 ${mine ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <Avatar user={m.sender} size="chat" />
                      <div
                        className={`relative max-w-[min(85%,30rem)] min-w-[5rem] rounded-2xl px-4 py-2.5 ${
                          mine ? "rounded-tr-none" : "rounded-tl-none"
                        } ${
                          isTask
                            ? "border border-violet-200/80 bg-violet-50 text-violet-950 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-100"
                            : mine
                              ? "bg-[#26b69c] text-white"
                              : "bg-slate-100 text-slate-900 dark:bg-gray-800 dark:text-white"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                        <p
                          className={`mt-3 text-[10px] absolute right-2 ${
                            mine && !isTask ? "text-white/70" : "text-slate-500"
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSubmit}
                className="relative border-t border-slate-200 p-3 dark:border-gray-800"
              >
                {projectPicker.open && activeContracts.length > 0 ? (
                  <div
                    className="absolute bottom-full left-3 right-3 z-20 mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
                    role="listbox"
                    aria-label="Select project"
                  >
                    <p className="border-b border-slate-100 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:border-gray-800">
                      Pick a project
                    </p>
                    <ul className="max-h-48 overflow-y-auto p-1">
                      {filteredProjects.length ? (
                        filteredProjects.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              role="option"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => insertProjectMention(c)}
                              className="flex w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-800 transition hover:bg-[#26b69c]/10 dark:text-slate-200"
                            >
                              {c.jobTitle}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-sm text-slate-500">No matching project</li>
                      )}
                    </ul>
                  </div>
                ) : null}

                {isTaskDraft ? (
                  <p className="mb-2 text-[11px] font-medium text-violet-700 dark:text-violet-300">
                    Task mode — send to create.{" "}
                    {activeContracts.length > 1
                      ? "Type @ to link a project."
                      : null}
                    {selectedProjectLabel ? (
                      <span className="text-slate-600 dark:text-slate-400">
                        {" "}
                        Selected Project Is {selectedProjectLabel}
                      </span>
                    ) : null}
                  </p>
                ) : (
                  <p className="mb-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-violet-600 dark:text-violet-400">#</span>{" "}
                    task · <span className="font-semibold text-[#26b69c]">@</span> project
                  </p>
                )}

                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={handleDraftChange}
                    onKeyDown={handleComposerKeyDown}
                    placeholder={
                      activeContracts.length > 1
                        ? "# Task title @Project… or type a message"
                        : "# Task title or type a message"
                    }
                    className={`min-w-0 flex-1 rounded-xl border bg-transparent px-4 py-2.5 text-sm outline-none dark:border-gray-700 ${
                      isTaskDraft
                        ? "border-violet-300 focus:border-violet-500 dark:border-violet-800"
                        : "border-slate-200 focus:border-[#26b69c]"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={busy || !draft.trim()}
                    title={isTaskDraft ? "Create task" : "Send message"}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-50 ${
                      isTaskDraft ? "bg-violet-600 hover:bg-violet-700" : "bg-[#26b69c]"
                    }`}
                  >
                    <PiPaperPlaneRight size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}
