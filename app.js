const STORAGE_KEY = "study-planner-minimal-v1";
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const courseInput = document.querySelector("#task-course");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyCopy = document.querySelector("#empty-copy");
const formError = document.querySelector("#form-error");
const remainingCount = document.querySelector("#remaining-count");
const allCount = document.querySelector("#all-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = [...document.querySelectorAll(".filter-button")];

let tasks = loadTasks();
let activeFilter = "all";

function isTask(value) {
  return value && typeof value.id === "string" && typeof value.title === "string" && typeof value.course === "string" && typeof value.completed === "boolean";
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(isTask) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    return;
  }
}

function getVisibleTasks() {
  if (activeFilter === "active") return tasks.filter((task) => !task.completed);
  if (activeFilter === "completed") return tasks.filter((task) => task.completed);
  return tasks;
}

function makeTaskRow(task) {
  const row = document.createElement("li");
  row.className = `task-row${task.completed ? " is-complete" : ""}`;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "task-toggle";
  toggle.textContent = "✓";
  toggle.setAttribute("aria-label", `${task.completed ? "Mark incomplete" : "Mark complete"}: ${task.title}`);
  toggle.setAttribute("aria-pressed", String(task.completed));
  toggle.addEventListener("click", () => {
    task.completed = !task.completed;
    saveTasks();
    render();
  });

  const copy = document.createElement("div");
  copy.className = "task-copy";
  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;
  copy.append(title);
  if (task.course) {
    const course = document.createElement("p");
    course.className = "task-course";
    course.textContent = task.course;
    copy.append(course);
  }

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-button";
  remove.textContent = "Remove";
  remove.setAttribute("aria-label", `Remove ${task.title}`);
  remove.addEventListener("click", () => {
    tasks = tasks.filter((item) => item.id !== task.id);
    saveTasks();
    render();
  });

  row.append(toggle, copy, remove);
  return row;
}

function render() {
  const shown = getVisibleTasks();
  taskList.replaceChildren(...shown.map(makeTaskRow));
  const remaining = tasks.filter((task) => !task.completed).length;
  remainingCount.textContent = String(remaining);
  allCount.textContent = String(tasks.length);
  clearCompletedButton.hidden = !tasks.some((task) => task.completed);
  emptyState.hidden = shown.length > 0;

  if (tasks.length === 0) {
    emptyTitle.textContent = "Nothing here yet";
    emptyCopy.textContent = "Add a task to get started.";
  } else if (shown.length === 0) {
    emptyTitle.textContent = activeFilter === "active" ? "All caught up" : "No completed tasks";
    emptyCopy.textContent = activeFilter === "active" ? "Everything on your list is done." : "Completed tasks will appear here.";
  }
}

function updateFilters() {
  filterButtons.forEach((button) => {
    const selected = button.dataset.filter === activeFilter;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    formError.hidden = false;
    titleInput.setAttribute("aria-invalid", "true");
    titleInput.focus();
    return;
  }

  tasks.unshift({
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    course: courseInput.value.trim(),
    completed: false,
  });
  saveTasks();
  form.reset();
  formError.hidden = true;
  titleInput.removeAttribute("aria-invalid");
  activeFilter = "all";
  updateFilters();
  render();
  titleInput.focus();
});

titleInput.addEventListener("input", () => {
  if (titleInput.value.trim()) {
    formError.hidden = true;
    titleInput.removeAttribute("aria-invalid");
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    updateFilters();
    render();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

const today = new Date();
document.querySelector("#today-label").textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "long", month: "long", day: "numeric",
}).format(today).toUpperCase();

render();
