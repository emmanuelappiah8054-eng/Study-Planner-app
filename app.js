const STORAGE_KEY = "studyboard-kanban-tasks-v1";
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const courseInput = document.querySelector("#task-course");
const openList = document.querySelector("#open-list");
const doneList = document.querySelector("#done-list");
const openEmpty = document.querySelector("#open-empty");
const doneEmpty = document.querySelector("#done-empty");
const formError = document.querySelector("#form-error");
const openCount = document.querySelector("#open-count");
const doneCount = document.querySelector("#done-count");
const openLaneCount = document.querySelector("#open-lane-count");
const doneLaneCount = document.querySelector("#done-lane-count");
const allCount = document.querySelector("#all-count");
const footerTotal = document.querySelector("#footer-total");
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

function makeTaskCard(task) {
  const card = document.createElement("li");
  card.className = "task-card";
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

  const actions = document.createElement("div");
  actions.className = "task-actions";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "task-toggle";
  toggle.textContent = task.completed ? "↶" : "✓";
  toggle.setAttribute("aria-label", `${task.completed ? "Move to in progress" : "Mark done"}: ${task.title}`);
  toggle.setAttribute("aria-pressed", String(task.completed));
  toggle.addEventListener("click", () => {
    task.completed = !task.completed;
    saveTasks();
    render();
  });

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-button";
  remove.textContent = "×";
  remove.setAttribute("aria-label", `Remove ${task.title}`);
  remove.addEventListener("click", () => {
    tasks = tasks.filter((item) => item.id !== task.id);
    saveTasks();
    render();
  });
  actions.append(toggle, remove);
  card.append(copy, actions);
  return card;
}

function render() {
  const showOpen = activeFilter !== "completed";
  const showDone = activeFilter !== "active";
  const openTasks = tasks.filter((task) => !task.completed);
  const doneTasks = tasks.filter((task) => task.completed);
  openList.replaceChildren(...(showOpen ? openTasks : []).map(makeTaskCard));
  doneList.replaceChildren(...(showDone ? doneTasks : []).map(makeTaskCard));
  openEmpty.hidden = !showOpen || openTasks.length > 0;
  doneEmpty.hidden = !showDone || doneTasks.length > 0;
  openCount.textContent = String(openTasks.length);
  doneCount.textContent = String(doneTasks.length);
  openLaneCount.textContent = String(openTasks.length);
  doneLaneCount.textContent = String(doneTasks.length);
  allCount.textContent = String(tasks.length);
  footerTotal.textContent = `${tasks.length} ${tasks.length === 1 ? "TASK" : "TASKS"}`;
  clearCompletedButton.hidden = doneTasks.length === 0;
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

const now = new Date();
document.querySelector("#today-label").textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "short", month: "long", day: "numeric",
}).format(now).toUpperCase();

render();