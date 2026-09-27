const themeToggle = document.querySelector(".ThemeToggle input");

themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");

  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

const usertaskinput = document.getElementById("AddNewTask");
const btn = document.getElementById("Btn");

const allTasks = document.getElementById("allTasks");
const activeTasks = document.getElementById("activeTasks");
const completedTasks = document.getElementById("completedTasks");
const importantTasks = document.getElementById("importantTasks");

function updateCounters() {
  const tasks = document.querySelectorAll(".Task");
  const completed = document.querySelectorAll(".Task.completed");
  const important = document.querySelectorAll(".Task.important");

  allTasks.textContent = tasks.length;
  completedTasks.textContent = completed.length;
  activeTasks.textContent = tasks.length - completed.length;
  importantTasks.textContent = important.length;
}

function createTaskElement(taskText, completed, important) {
  const element = document.createElement("div");
  element.classList.add("Task");

  const checkElement = document.createElement("input");
  checkElement.type = "checkbox";

  const taskElement = document.createElement("span");
  taskElement.textContent = taskText;

  element.append(checkElement, taskElement);

  const taskActions = document.createElement("div");
  taskActions.classList.add("TaskActions");

  const editIcon = document.createElement("i");
  editIcon.classList.add("fa-solid", "fa-pen");

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fa-solid", "fa-trash");

  const importantIcon = document.createElement("i");
  importantIcon.classList.add("fa-regular", "fa-star");

  if (completed) {
    checkElement.checked = true;
    element.classList.add("completed");
  }

  if (important) {
    element.classList.add("important");
    importantIcon.classList.remove("fa-regular");
    importantIcon.classList.add("fa-solid");
  }

  taskActions.append(editIcon, deleteIcon, importantIcon);
  element.append(taskActions);

  return {
    element,
    checkElement,
    taskElement,
    editIcon,
    deleteIcon,
    importantIcon,
  };
}

function bindTaskEvents({
  element,
  checkElement,
  taskElement,
  editIcon,
  deleteIcon,
  importantIcon,
}) {
  importantIcon.addEventListener("click", () => {
    importantIcon.classList.toggle("fa-regular");
    importantIcon.classList.toggle("fa-solid");

    element.classList.toggle("important");

    updateTaskInLS(
      taskElement.textContent,
      checkElement.checked,
      element.classList.contains("important"),
    );

    updateCounters();
  });

  deleteIcon.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskFromLS(taskElement.textContent);

      element.remove();
      updateCounters();
    }
  });

  editIcon.addEventListener("click", () => {
    const taskSpan = element.querySelector("span");
    const oldTaskText = taskSpan.textContent;

    let editedTask = prompt("You can input the edit task here ..");

    if (editedTask === null) return;

    if (editedTask.trim() === "") {
      alert("Empty edit is not allowed");
      return;
    }

    if (editedTask.toLowerCase() === oldTaskText.toLowerCase()) {
      alert("You cannot edit with already existing task");
      return;
    }

    const checkTasks = document.querySelectorAll(".Task span");
    let exists = false;

    checkTasks.forEach((span) => {
      if (span.textContent.toLowerCase() === editedTask.toLowerCase()) {
        exists = true;
      }
    });

    if (exists) {
      alert("The task already exists");
      return;
    }

    taskSpan.textContent = editedTask;
    editTaskInLS(oldTaskText, editedTask);
  });

  checkElement.addEventListener("change", () => {
    element.classList.toggle("completed", checkElement.checked);

    updateTaskInLS(
      taskElement.textContent,
      checkElement.checked,
      element.classList.contains("important"),
    );

    updateCounters();
  });
}

function addNewTask(task, saveToLS = true) {
  const taskText = typeof task === "object" ? task.text : task;
  const completed = typeof task === "object" ? !!task.completed : false;
  const important = typeof task === "object" ? !!task.important : false;

  if (taskText === "") {
    alert("You cannot add empty task");
    return;
  }

  const duplicate = document.querySelectorAll(".Task span");

  for (const span of duplicate) {
    if (taskText.toLowerCase() === span.textContent.toLowerCase()) {
      alert("You already have this task");
      usertaskinput.value = "";
      return;
    }
  }

  const taskList = document.querySelector(".TaskList");
  const taskRow = createTaskElement(taskText, completed, important);

  taskList.append(taskRow.element);
  bindTaskEvents(taskRow);

  if (saveToLS) {
    saveTaskInLS(taskText, completed, important);
  }

  usertaskinput.value = "";
}
const searchInput = document.getElementById("SearchTask");

function searchForTask() {
  const taskForSearch = document.querySelectorAll(".Task");
  const query = searchInput.value.toLowerCase();

  taskForSearch.forEach((element) => {
    if (element.textContent.toLowerCase().includes(query)) {
      element.style.display = "flex";
    } else {
      element.style.display = "none";
    }
  });
}

const allTab = document.getElementById("allTab");
const activeTab = document.getElementById("activeTab");
const completedTab = document.getElementById("completedTab");
const importantTab = document.getElementById("importantTab");

function taskTabs(event) {
  const tasks = document.querySelectorAll(".Task");

  document.querySelectorAll(".TaskTabs button").forEach((button) => {
    button.classList.remove("active");
  });

  event.target.classList.add("active");

  if (event.target.id === "allTab") {
    tasks.forEach((element) => {
      element.style.display = "flex";
    });
  } else if (event.target.id === "activeTab") {
    tasks.forEach((element) => {
      if (element.classList.contains("completed")) {
        element.style.display = "none";
      } else {
        element.style.display = "flex";
      }
    });
  } else if (event.target.id === "completedTab") {
    tasks.forEach((element) => {
      if (element.classList.contains("completed")) {
        element.style.display = "flex";
      } else {
        element.style.display = "none";
      }
    });
  } else if (event.target.id === "importantTab") {
    tasks.forEach((element) => {
      if (element.classList.contains("important")) {
        element.style.display = "flex";
      } else {
        element.style.display = "none";
      }
    });
  }
}

function saveTaskInLS(taskText, completed, important) {
  const arrTasks = localStorage.getItem("tasks");

  const tasks = arrTasks ? JSON.parse(arrTasks) : [];

  tasks.push({
    text: taskText,
    completed: completed,
    important: important,
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLS() {
  const arrTasks = localStorage.getItem("tasks");
  const tasks = arrTasks ? JSON.parse(arrTasks) : [];

  tasks.forEach((task) => addNewTask(task, false));

  updateCounters();
}

function deleteTaskFromLS(taskText) {
  const arrTasks = localStorage.getItem("tasks");
  const tasks = arrTasks ? JSON.parse(arrTasks) : [];

  const filteredTasks = tasks.filter((task) => task.text !== taskText);

  localStorage.setItem("tasks", JSON.stringify(filteredTasks));
}

function editTaskInLS(oldText, newText) {
  const arrTasks = localStorage.getItem("tasks");
  const tasks = arrTasks ? JSON.parse(arrTasks) : [];

  const task = tasks.find((task) => task.text === oldText);

  if (task) {
    task.text = newText;
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateTaskInLS(taskText, completed, important) {
  const arrTasks = localStorage.getItem("tasks");
  const tasks = arrTasks ? JSON.parse(arrTasks) : [];

  const task = tasks.find((task) => task.text === taskText);

  if (task) {
    task.completed = completed;
    task.important = important;
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

allTab.addEventListener("click", taskTabs);
activeTab.addEventListener("click", taskTabs);
completedTab.addEventListener("click", taskTabs);
importantTab.addEventListener("click", taskTabs);

searchInput.addEventListener("input", searchForTask);

btn.addEventListener("click", () => addNewTask(usertaskinput.value));

loadTasksFromLS();

allTab.classList.add("active");
const darkMode = localStorage.getItem("darkMode");

if (darkMode === "true") {
  document.body.classList.add("dark");
  themeToggle.checked = true;
}
