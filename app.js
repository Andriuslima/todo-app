// Speech recognition stuff
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var cmds = ['tarefa', 'completar', 'remover', 'filtrar'];
var cmdsGrammar = '#JSGF V1.0; grammar colors; public <color> = ' + cmds.join(' | ') + ' ;'

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(cmdsGrammar, 1);
recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = 'pt-BR';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

//Select DOM
const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".filter-todo");
const command = document.querySelector('.command')

//Event Listeners
document.addEventListener("DOMContentLoaded", getTodos);
todoButton.addEventListener("click", addTodo);
todoList.addEventListener("click", deleteTodo);
filterOption.addEventListener("click", filterTodo);

document.onkeydown = function (event) {
  if (event.code === 'Space') {
    recognition.start();
    document.body.classList.add("listening")
    console.log('Recognition started');
  } else {
    console.log(`key ${event.code} pressed`)
  }
}

recognition.onresult = function(event) {
  const result = event.results[0][0];
  if (result.confidence < 0.6) {
    alert('Não entendi o que é pra fazer')
  }
  const transcript = result.transcript;
  const cmd = transcript.split(" ")[0];
  const body = transcript.substr(cmd.length + 1)
  console.log('Transcript: ' + transcript);
  console.log('Command received: ' + cmd);
  console.log('Cmd body: ' + body);
  console.log('Confidence: ' + event.results[0][0].confidence);

  try {
    if (cmd === 'tarefa') {
      addTodoWithText(body)
    } else if (cmd === 'remover') {
      deleteTodoByIndex(body.replaceAll(" ", ""))
    } else if (cmd === 'completar') {
      completeTodoByIndex(body.replaceAll(" ", ""))
    } else if (cmd === 'filtrar') {
      filterBy(body.replaceAll(" ", ""))
    } else {
      console.log(`Not sure what to do with: ${cmd} follow by ${body}`)
    }
  } finally {
    command.innerHTML = "Comando: " + transcript
    recognition.stop();
    document.body.classList.remove("listening")
  }
}

recognition.onspeechend = function() {
  recognition.stop();
  document.body.classList.remove("listening")
}

recognition.onnomatch = function(event) {
  console.log(`${event.results[0][0].transcript} did not match anything`)
}

recognition.onerror = function(event) {
  console.log(`Error occurred in recognition: ${event.error}`)
}

//Functions

function addTodoWithText(text) {
  console.log("Adding todo: " + text)
  const todoDiv = document.createElement("div");
  todoDiv.classList.add("todo");
  const newTodo = document.createElement("li");
  newTodo.innerText = text
  saveLocalTodos(todoInput.value);
  newTodo.classList.add("todo-item");
  todoDiv.appendChild(newTodo);
  todoInput.value = "";
  //Create Completed Button
  const completedButton = document.createElement("button");
  completedButton.innerHTML = `<i class="fas fa-check"></i>`;
  completedButton.classList.add("complete-btn");
  todoDiv.appendChild(completedButton);
  //Create trash button
  const trashButton = document.createElement("button");
  trashButton.innerHTML = `<i class="fas fa-trash"></i>`;
  trashButton.classList.add("trash-btn");
  todoDiv.appendChild(trashButton);
  //attach final Todo
  todoList.appendChild(todoDiv);
}

function addTodo(e) {
  //Prevent natural behaviour
  e.preventDefault();
  //Create todo div
  const todoDiv = document.createElement("div");
  todoDiv.classList.add("todo");
  //Create list
  const newTodo = document.createElement("li");
  newTodo.innerText = todoInput.value;
  //Save to local - do this last
  //Save to local
  saveLocalTodos(todoInput.value);
  //
  newTodo.classList.add("todo-item");
  todoDiv.appendChild(newTodo);
  todoInput.value = "";
  //Create Completed Button
  const completedButton = document.createElement("button");
  completedButton.innerHTML = `<i class="fas fa-check"></i>`;
  completedButton.classList.add("complete-btn");
  todoDiv.appendChild(completedButton);
  //Create trash button
  const trashButton = document.createElement("button");
  trashButton.innerHTML = `<i class="fas fa-trash"></i>`;
  trashButton.classList.add("trash-btn");
  todoDiv.appendChild(trashButton);
  //attach final Todo
  todoList.appendChild(todoDiv);
}

function deleteTodoByIndex(index) {
  if (index === 'um') {
    index = 1
  } else if (index === 'dois') {
    index = 2
  }
  console.log("Removing todo with index: " + index)
  const todo = todoList.children.item(index-1)
  todo.classList.add("fall");
  removeLocalTodos(todo);
  todo.addEventListener("transitionend", e => {
    todo.remove();
  });
}

function deleteTodo(e) {
  const item = e.target;

  if (item.classList[0] === "trash-btn") {
    // e.target.parentElement.remove();
    const todo = item.parentElement;
    todo.classList.add("fall");
    //at the end
    removeLocalTodos(todo);
    todo.addEventListener("transitionend", e => {
      todo.remove();
    });
  }
  if (item.classList[0] === "complete-btn") {
    const todo = item.parentElement;
    todo.classList.toggle("completed");
    console.log(todo);
  }
}

function completeTodoByIndex(index) {
  if (index === 'um') {
    index = 1
  } else if (index === 'dois') {
    index = 2
  }

  console.log("Completing todo with index: " + index)
  const todo = todoList.children.item(index-1)
  todo.classList.toggle("completed");
}

function filterBy(text) {
  const todos = todoList.childNodes;
  todos.forEach(function(todo) {
    switch (text) {
      case "todos":
        todo.style.display = "flex";
        break;
      case "completados":
        if (todo.classList.contains("completed")) {
          todo.style.display = "flex";
        } else {
          todo.style.display = "none";
        }
        break;
      case "pendentes":
        if (!todo.classList.contains("completed")) {
          todo.style.display = "flex";
        } else {
          todo.style.display = "none";
        }
    }

    filterOption.value = text
  });
}

function filterTodo(e) {
  const todos = todoList.childNodes;
  todos.forEach(function(todo) {
    switch (e.target.value) {
      case "todos":
        todo.style.display = "flex";
        break;
      case "completados":
        if (todo.classList.contains("completed")) {
          todo.style.display = "flex";
        } else {
          todo.style.display = "none";
        }
        break;
      case "pendentes":
        if (!todo.classList.contains("completed")) {
          todo.style.display = "flex";
        } else {
          todo.style.display = "none";
        }
    }
  });
}

function saveLocalTodos(todo) {
  let todos;
  if (localStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));
  }
  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos));
}
function removeLocalTodos(todo) {
  let todos;
  if (localStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));
  }
  const todoIndex = todo.children[0].innerText;
  todos.splice(todos.indexOf(todoIndex), 1);
  localStorage.setItem("todos", JSON.stringify(todos));
}

function getTodos() {
  let todos;
  if (localStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));
  }
  todos.forEach(function(todo) {
    //Create todo div
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");
    //Create list
    const newTodo = document.createElement("li");
    newTodo.innerText = todo;
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);
    todoInput.value = "";
    //Create Completed Button
    const completedButton = document.createElement("button");
    completedButton.innerHTML = `<i class="fas fa-check"></i>`;
    completedButton.classList.add("complete-btn");
    todoDiv.appendChild(completedButton);
    //Create trash button
    const trashButton = document.createElement("button");
    trashButton.innerHTML = `<i class="fas fa-trash"></i>`;
    trashButton.classList.add("trash-btn");
    todoDiv.appendChild(trashButton);
    //attach final Todo
    todoList.appendChild(todoDiv);
  });
}
