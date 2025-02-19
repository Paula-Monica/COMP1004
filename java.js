//Displays info when user clicks on info
document.querySelector('.info-link').addEventListener('click', function (event) {
  const infoDiv = document.querySelector('.information');
  infoDiv.classList.toggle('active'); 
  infoDiv.classList.remove('hidden'); 
});

//Moves welcome page off screen and removes it
document.addEventListener('DOMContentLoaded', function () {
  const homepage = document.querySelector('.homepage');
  document.querySelector('.cta-button').addEventListener('click', function () {
      homepage.classList.add('hidden-up'); 

      //Wait for 2 seconds, then remove the elements
      setTimeout(() => {
          homepage.remove(); 
      }, 2000);
  });
});

//syncs the height of key to the created tasks height
function syncToCombinedHeight() {
  const tasks = document.querySelector('.CreatedTasks');
  const another = document.querySelector('.CreateTask');
  const key = document.querySelector('.Key');

  key.style.height = 'auto';

  const combinedHeight = tasks.offsetHeight + another.offsetHeight;

  key.style.height = combinedHeight + 'px';
}

window.addEventListener('load', syncToCombinedHeight);
window.addEventListener('resize', syncToCombinedHeight);


let taskNameInputted = false;
let hourSplitSelected = 1;
let tasks = [];

const TaskName = document.querySelector('.TaskName-input');
const icon = document.querySelector('.TaskName-icon');
const NoTaskName = document.querySelector('.NoTaskName');
const NoSplitSelected = document.querySelector('.NoSplitSelected');

//Create tasks when all conditons for creating tasks are met
icon.addEventListener('click', () => {
  const taskNameEmpty = TaskName.value.trim() === '';
  const splitNotSelected = hourSplitSelected == false;

  if (taskNameEmpty) {
    NoTaskName.style.visibility = 'visible';
  } else {
    NoTaskName.style.visibility = 'hidden';
  }

  if (splitNotSelected) {
    NoSplitSelected.style.visibility = 'visible';
  } else {
    NoSplitSelected.style.visibility = 'hidden';
  }

  if (!taskNameEmpty && !splitNotSelected) {
    //Check if any .TaskX container has segments
    let taskContainers = document.querySelectorAll('[class^="Task"]'); // Selects all task containers
    let tasksExist = false;

    taskContainers.forEach(container => {
      if (container.querySelector('.segment')) { //check if segments exist
        tasksExist = true;
      }
    });

    if (tasksExist) {
      alert("Please clear previous tasks before adding a new one.");
      return; //Stop execution if segments exist
    }
  
    const CalculateNoOfTasks = hoursPerWeek / hourSplitSelected;

    let newTask = {
      id: tasks.length + 1,
      name: TaskName.value, //Get task name directly
      totalDuration: hoursPerWeek, //Store total duration
      segments: [], //Array to store task segments
      assigned: false,
    };

    for (let i = 0; i < CalculateNoOfTasks; i++) {
      newTask.segments.push({
        segmentId: i + 1,
        duration: hourSplitSelected, //Duration for each segment
        assigned: false, //If assigned to the timetable
      });
    }

    tasks.push(newTask); //Add task to the task list
    displayTaskSegments(newTask); //Display segments
  }
});

//Shows created tasks
function displayTaskSegments(task) {
  task.segments.forEach((segment, index) => {
    const taskContainer = document.querySelector(`.Task${index + 1}`);

    if (!taskContainer) {
      console.error(`Error: No task container found for Task${index + 1}`);
      return;
    }

    //Create segment element
    let segmentDiv = document.createElement("div");
    segmentDiv.classList.add("segment");

    //Task Name
    let taskNameDiv = document.createElement("div");
    taskNameDiv.classList.add("task-name");
    taskNameDiv.textContent = task.name;

    //Hour Split
    let hourSplitDiv = document.createElement("div");
    hourSplitDiv.classList.add("hour-split");
    hourSplitDiv.textContent = `Duration: ${segment.duration}h`;

    segmentDiv.appendChild(taskNameDiv);
    segmentDiv.appendChild(hourSplitDiv);

    // Only add dropdown and complete button to first segment
    if (index === 0) {
      //Create dropdown menu
      let categoryDropdown = document.createElement("select");
      categoryDropdown.classList.add("category-dropdown");

      let optionWork = document.createElement("option");
      optionWork.value = "work";
      optionWork.textContent = "Work";

      let optionFree = document.createElement("option");
      optionFree.value = "free";
      optionFree.textContent = "Free";

      categoryDropdown.appendChild(optionWork);
      categoryDropdown.appendChild(optionFree);

      //Create complete button
      let completeButton = document.createElement("button");
      completeButton.classList.add("complete-btn");
      completeButton.textContent = "Complete";

      //delete the entire task
      completeButton.addEventListener("click", () => {
        deleteTask(task.id);
      });

      segmentDiv.appendChild(categoryDropdown);
      segmentDiv.appendChild(completeButton);
    }

    taskContainer.appendChild(segmentDiv);
  });
}

function deleteTask(taskId) {
  // Find the task by ID
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex !== -1) {
    // Get the task being deleted
    const deletedTask = tasks[taskIndex];

    // Remove the task from the list
    tasks.splice(taskIndex, 1);

    // Remove only the segments related to this task
    deletedTask.segments.forEach((segment, index) => {
      const taskContainer = document.querySelector(`.Task${index + 1}`);
      if (taskContainer) {
        taskContainer.innerHTML = ""; // Clear segment inside TaskX
      }
    });
  }
}

let hoursPerWeek = 1;
const hourDropdown = document.querySelector('.hour-dropdown');

hourDropdown.addEventListener('change', () => {
  const selectedValue = hourDropdown.value; 
  hoursPerWeek = parseInt(selectedValue); 

  console.log('Hours as number:', hoursPerWeek);
  EditSplitHours(hoursPerWeek);

});

const radios = document.querySelectorAll('input[name="hours"]');

radios.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      // Extract the number from the value 
      hourSplitSelected = parseInt(radio.value); 
    }
  });
});

//Radio buttons for split hours, make only ones that numerically make sense selectable
function EditSplitHours(h) {
  const radio1h = document.querySelector('input[value="1h"]');
  const radio2h = document.querySelector('input[value="2h"]');
  const radio3h = document.querySelector('input[value="3h"]');
  const radio4h = document.querySelector('input[value="4h"]');

  if (h % 2 !== 0) {
    radio2h.disabled = true; // Disable 2h if not divisible by 2
    if (radio2h.checked) {
      radio2h.checked = false;
      hourSplitSelected = false;
    } 
  } else {
    radio2h.disabled = false; // Enable 2h if divisible by 2
  }

  if (h % 3 !== 0) {
    radio3h.disabled = true; // Disable 3h if not divisible by 3
    if (radio3h.checked) {
      radio3h.checked = false;
      hourSplitSelected = false;
    } 
  } else {
    radio3h.disabled = false; // Enable 3h if divisible by 3
  }

  if (h % 4 !== 0) {
    radio4h.disabled = true; // Disable 4h if not divisible by 4
    if (radio4h.checked) {
      radio4h.checked = false;
      hourSplitSelected = false;
    } 
  } else {
    radio4h.disabled = false; // Enable 4h if divisible by 4
  }
}

//Turn selected grids green on press
document.addEventListener("DOMContentLoaded", function () {
  const cells = document.querySelectorAll(".timetable-grid td:not(:first-child)");
  const selectedColor = "rgb(193, 219, 181)"; 

  cells.forEach(cell => {
    cell.addEventListener("click", function () {
      let currentColor = window.getComputedStyle(this).backgroundColor;

      if (currentColor === selectedColor) {
        this.style.backgroundColor = ""; // Reset to original colour
      } else {
        this.style.backgroundColor = selectedColor;
      }
    });
  });
});

//Trash icon clears all segments not within timetable
document.querySelector(".Trash-Container").addEventListener("click", () => {
  document.querySelectorAll('.Task1, .Task2, .Task3, .Task4, .Task5, .Task6, .Task7, .Task8, .Task9, .Task10')
    .forEach(container => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    });
    //Only remove tasks which have segments not assigned to table
  tasks = tasks.filter(task => task.segments.every(segment => !segment.assigned));
});