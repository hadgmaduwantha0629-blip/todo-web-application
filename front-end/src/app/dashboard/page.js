"use client";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { createTodo, deleteTodo, getTodos, updateTodo } from "@/services/todoservices";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function DashboardPage() {
    const { user } = useAuth();
    const { pushToast } = useToast();
    const router = useRouter();

    // Dashboard state is intentionally local so updates stay responsive.
    const [todos, setTodos] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [pendingDeleteTodo, setPendingDeleteTodo] = useState(null);

    const loadTodos = async () => {
        // Read the token from storage so refreshes keep the session alive.
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        try {
            setIsLoading(true);
            const data = await getTodos(token);
            setTodos(data.todos ?? []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        loadTodos();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const handleCreateTodo = async () => {
        if (!title.trim()) {
            pushToast({
                title: "Title required",
                description: "Please enter a title before adding the todo.",
                tone: "error",
            });
            return;
        }

        try {
            await createTodo(localStorage.getItem("token"), {
                title,
                description,
            });

            setTitle("");
            setDescription("");
            await loadTodos();
            pushToast({
                title: "Todo added",
                description: "Your new task was added successfully.",
                tone: "success",
            });
        } catch (error) {
            console.error(error);
            pushToast({
                title: "Create failed",
                description: "We could not add the todo right now.",
                tone: "error",
            });
        }
    };

    const handleDeleteTodo = async (id) => {
        try {
            await deleteTodo(localStorage.getItem("token"), id);
            await loadTodos();
            pushToast({
                title: "Todo deleted",
                description: "The task was removed from your list.",
                tone: "success",
            });
        } catch (error) {
            console.error(error);
            pushToast({
                title: "Delete failed",
                description: "We could not remove the todo right now.",
                tone: "error",
            });
        }
    };

    const requestDeleteTodo = (todo) => {
        // Completed todos delete immediately; pending todos ask for confirmation.
        if (todo.completed) {
            handleDeleteTodo(todo.id);
            return;
        }

        setPendingDeleteTodo(todo);
    };

    const confirmDeleteTodo = () => {
        if (!pendingDeleteTodo) {
            return;
        }

        handleDeleteTodo(pendingDeleteTodo.id);
        setPendingDeleteTodo(null);
    };

    const handleUpdateTodo = async (id) => {
        if (!editTitle.trim()) {
            pushToast({
                title: "Title required",
                description: "Please enter a title before saving changes.",
                tone: "error",
            });
            return;
        }

        try {
            await updateTodo(localStorage.getItem("token"), id, {
                title: editTitle,
                description: editDescription,
            });

            setEditingId(null);
            setEditTitle("");
            setEditDescription("");
            await loadTodos();
            pushToast({
                title: "Todo updated",
                description: "Your changes were saved successfully.",
                tone: "success",
            });
        } catch (error) {
            console.log(error?.response);
            console.log(error?.response?.data);
            pushToast({
                title: "Update failed",
                description: error?.response?.data?.message ?? "We could not save the changes right now.",
                tone: "error",
            });
        }
    };

    const handleToggleStatus = async (todo) => {
        try {
            await updateTodo(localStorage.getItem("token"), todo.id, {
                title: todo.title,
                description: todo.description,
                completed: !todo.completed,
            });

            await loadTodos();
            pushToast({
                title: todo.completed ? "Marked pending" : "Marked complete",
                description: todo.completed
                    ? "The task is now back in your pending list."
                    : "The task is now completed.",
                tone: "success",
            });
        } catch (error) {
            console.error(error);
            pushToast({
                title: "Status update failed",
                description: "We could not change the task status right now.",
                tone: "error",
            });
        }
    };

    const filteredTodos = useMemo(() => {
        return todos.filter((todo) => {
            const matchesSearch =
                todo.title.toLowerCase().includes(search.toLowerCase()) ||
                (todo.description || "").toLowerCase().includes(search.toLowerCase());

            const matchesFilter =
                filter === "all" ||
                (filter === "completed" && todo.completed) ||
                (filter === "pending" && !todo.completed);

            return matchesSearch && matchesFilter;
        });
    }, [filter, search, todos]);

    const completedCount = todos.filter((todo) => todo.completed).length;
    const pendingCount = todos.length - completedCount;

    return (
        <main className="page-shell">
            <div className="page-container space-y-6">
                <header className="panel flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
                    <div className="space-y-3">
                        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                            Workspace overview
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                Dashboard
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                                Welcome{user?.name ? `, ${user.name}` : ""}. Keep your tasks organized in a clean white workspace.
                            </p>
                        </div>
                    </div>

                    <button onClick={handleLogout} className="ui-button-danger w-full lg:w-auto">
                        Logout
                    </button>
                </header>

                <section className="grid gap-4 md:grid-cols-3">
                    {[
                        { label: "Total tasks", value: todos.length, tone: "bg-slate-900 text-white" },
                        { label: "Completed", value: completedCount, tone: "bg-emerald-50 text-emerald-700" },
                        { label: "Pending", value: pendingCount, tone: "bg-amber-50 text-amber-700" },
                    ].map((item) => (
                        <div key={item.label} className="panel-soft p-5">
                            <p className="text-sm font-medium text-slate-500">{item.label}</p>
                            <div className={`mt-4 inline-flex rounded-2xl px-4 py-2 text-3xl font-semibold ${item.tone}`}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="panel p-6 sm:p-8">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Add Todo</h2>
                                <p className="mt-1 text-sm text-slate-600">Create a new task with soft controls and clear spacing.</p>
                            </div>
                            <span className="ui-badge-neutral">{todos.length} items</span>
                        </div>

                        <div className="mt-6 space-y-4">
                            <input
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="ui-input"
                            />

                            <textarea
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="ui-textarea"
                            />

                            <button onClick={handleCreateTodo} className="ui-button-primary w-full">
                                Add Todo
                            </button>
                        </div>
                    </div>

                    <div className="panel p-6 sm:p-8">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Search and filter</h2>
                                <p className="mt-1 text-sm text-slate-600">Quickly narrow the list using rounded, interactive chips.</p>
                            </div>

                            <input
                                type="text"
                                placeholder="Search todos..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="ui-input"
                            />

                            <div className="flex flex-wrap gap-3">
                                {[
                                    ["all", "All"],
                                    ["completed", "Completed"],
                                    ["pending", "Pending"],
                                ].map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setFilter(value)}
                                        className={`ui-pill ${filter === value ? "ui-pill-active" : ""}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="panel p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">My Todos</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                {isLoading ? "Loading your tasks..." : `${filteredTodos.length} task${filteredTodos.length === 1 ? "" : "s"} shown`}
                            </p>
                        </div>
                        <span className="ui-badge-success">Live</span>
                    </div>

                    <div className="mt-6 space-y-4">
                        {!isLoading && filteredTodos.length === 0 ? (
                            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                                <p className="text-lg font-semibold text-slate-950">No todos found.</p>
                                <p className="mt-2 text-sm text-slate-600">Try a different filter or add a new task to get started.</p>
                            </div>
                        ) : (
                            filteredTodos.map((todo) => {
                                const statusLabel = todo.completed ? "Completed" : "Pending";
                                const statusClass = todo.completed ? "ui-badge-success" : "ui-badge-warning";

                                return (
                                    <article
                                        key={todo.id}
                                        className="panel-soft p-5 transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                                    >
                                        {editingId === todo.id ? (
                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="ui-input"
                                                />

                                                <textarea
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    className="ui-textarea"
                                                />

                                                <div className="flex flex-col gap-3 sm:flex-row">
                                                    <button onClick={() => handleUpdateTodo(todo.id)} className="ui-button-success w-full sm:w-auto">
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(null);
                                                            setEditTitle("");
                                                            setEditDescription("");
                                                        }}
                                                        className="ui-button-secondary w-full sm:w-auto"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="space-y-2">
                                                        <h3 className="text-xl font-semibold tracking-tight text-slate-950">{todo.title}</h3>
                                                        <p className="max-w-2xl whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                            {todo.description || "No description added."}
                                                        </p>
                                                    </div>

                                                    <span className={statusClass}>{statusLabel}</span>
                                                </div>

                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                                        <input
                                                            type="checkbox"
                                                            checked={todo.completed}
                                                            onChange={() => handleToggleStatus(todo)}
                                                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-200"
                                                        />
                                                        Mark as {todo.completed ? "pending" : "completed"}
                                                    </label>

                                                    <div className="flex flex-col gap-3 sm:flex-row">
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(todo.id);
                                                                setEditTitle(todo.title);
                                                                setEditDescription(todo.description || "");
                                                            }}
                                                            className="ui-button-secondary w-full sm:w-auto"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() => requestDeleteTodo(todo)}
                                                            className="ui-button-danger w-full sm:w-auto"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                );
                            })
                        )}
                    </div>
                </section>

                {pendingDeleteTodo ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
                        <div className="panel w-full max-w-lg p-6 sm:p-8">
                            <div className="space-y-3">
                                <span className="ui-badge-warning">Todo not completed</span>
                                <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                                    Are you sure you want to delete this todo?
                                </h3>
                                <p className="text-sm leading-6 text-slate-600">
                                    This task is still pending. If you delete it now, it will be removed permanently.
                                </p>

                                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-sm font-medium text-slate-500">Todo title</p>
                                    <p className="mt-2 text-base font-semibold text-slate-950">
                                        {pendingDeleteTodo.title}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setPendingDeleteTodo(null)}
                                    className="ui-button-secondary w-full sm:w-auto"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDeleteTodo}
                                    className="ui-button-danger w-full sm:w-auto"
                                >
                                    Delete anyway
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </main>
    );
}