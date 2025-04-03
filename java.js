//Displays info when user clicks on info
document.querySelector('.info-link').addEventListener('click', function (event) {
  const infoDiv = document.querySelector('.information');
  infoDiv.classList.toggle('active'); 
  infoDiv.classList.remove('hidden'); 
});


//Moves welcome page off screen and removes it
document.addEventListener('DOMContentLoaded', function () {
  loadFromLocalStorage();
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
  console.log("Add button was pressed!");

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
    let assignedCategory = document.querySelector('.category-dropdown')?.value || "None";
    const CalculateNoOfTasks = hoursPerWeek / hourSplitSelected;

    let newTask = {
      id: tasks.length + 1,
      name: TaskName.value, //Get task name directly
      totalDuration: hoursPerWeek, //Store total duration
      segments: [], //Array to store task segments
      assigned: false,
      category: assignedCategory
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
    saveToLocalStorage();
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

    //Assign task and segment IDs for drag-and-drop tracking
    segmentDiv.dataset.taskId = task.id;
    segmentDiv.dataset.segmentId = segment.segmentId;

    //Make segment draggable
    segmentDiv.draggable = true;

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

    //Only add dropdown and complete button to first segment
    if (index === 0) {
      let categoryDropdown = document.createElement("select");
      categoryDropdown.classList.add("category-dropdown");

      // Retrieve existing categories
      const existingCategories = document.querySelectorAll(".categories-container .category-label input[type='text']");

      // Add a "None" option
      let optionNone = document.createElement("option");
      optionNone.value = "None";
      optionNone.textContent = "None";
      categoryDropdown.appendChild(optionNone);

      // Add all existing categories
      existingCategories.forEach(categoryInput => {
        let categoryName = categoryInput.value;
        let categoryColor = categoryInput.nextElementSibling.value; // Get color from color picker

        let categoryOption = document.createElement("option");
        categoryOption.value = categoryName;
        categoryOption.textContent = categoryName;
        categoryOption.dataset.color = categoryColor;

        categoryDropdown.appendChild(categoryOption);
      });

      categoryDropdown.addEventListener("change", function() {
        // Find the task in the tasks array
        const task = tasks.find(t => t.id === parseInt(segmentDiv.dataset.taskId));
        if (task) {
          // Update the task's category
          task.category = this.value;
          
          // Update the background color based on the selected option
          const selectedOption = this.options[this.selectedIndex];
          const selectedColor = selectedOption.dataset.color;
          
          // Apply color to all segments of this task
          updateAllTaskSegments(this.value, selectedColor);
          
          // Save to localStorage
          saveToLocalStorage();
        }
      });

      if (task.category && task.category !== "None") {
        // Set the dropdown to the saved category
        categoryDropdown.value = task.category;
        
        // Find the selected option to get its color
        const selectedOption = categoryDropdown.querySelector(`option[value="${task.category}"]`);
        if (selectedOption && selectedOption.dataset.color) {
          // Apply the color to the segment
          segmentDiv.style.backgroundColor = selectedOption.dataset.color;
        }
      }
      
      segmentDiv.appendChild(categoryDropdown);
      segmentDiv.appendChild(completeButton);

      let completeButton = document.createElement("button");
      completeButton.classList.add("complete-btn");
      completeButton.textContent = "Complete";

      completeButton.addEventListener("click", () => {
        deleteTask(task.id);
        saveToLocalStorage();
      });

      segmentDiv.appendChild(categoryDropdown);
      segmentDiv.appendChild(completeButton);
    }

    //Attach drag event
    segmentDiv.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", JSON.stringify({
        taskId: task.id,
        segmentId: segment.segmentId
      }));
    });

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

    // Remove all segments related to this task from the task containers
    deletedTask.segments.forEach((segment) => {
      // Remove from task containers
      const taskContainer = document.querySelector(`.Task${segment.segmentId}`);
      if (taskContainer) {
        taskContainer.innerHTML = ""; // Clear segment inside TaskX
      }

      // Remove from timetable (if dropped there)
      const timetableCells = document.querySelectorAll(".dropzone");
      timetableCells.forEach(cell => {
        const existingSegment = cell.querySelector(`.segment[data-task-id='${taskId}'][data-segment-id='${segment.segmentId}']`);
        if (existingSegment) {
          cell.removeChild(existingSegment); // Remove from timetable cell
        }
      });
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
      //Extract the number from the value 
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
    radio2h.disabled = true; //Disable 2h if not divisible by 2
    if (radio2h.checked) {
      radio2h.checked = false;
      hourSplitSelected = false;
    } 
  } else {
    radio2h.disabled = false; //Enable 2h if divisible by 2
  }

  if (h % 3 !== 0) {
    radio3h.disabled = true; //Disable 3h if not divisible by 3
    if (radio3h.checked) {
      radio3h.checked = false;
      hourSplitSelected = false;
    } 
  } else {
    radio3h.disabled = false; //Enable 3h if divisible by 3
  }

  if (h % 4 !== 0) {
    radio4h.disabled = true; //Disable 4h if not divisible by 4
    if (radio4h.checked) {
      radio4h.checked = false;
      hourSplitSelected = false;
    } 
  } else {
    radio4h.disabled = false; //Enable 4h if divisible by 4
  }
}

//Turn selected grids green on press
document.addEventListener("DOMContentLoaded", function () {
  enableDropzones();
  const cells = document.querySelectorAll(".timetable-grid td:not(:first-child)");
  const selectedColor = "rgb(193, 219, 181)"; 

  cells.forEach(cell => {
    cell.addEventListener("click", function (event) {
      // Check if the click happened inside a segment
      if (event.target.closest(".segment")) {
        return; // Stop function execution if a segment was clicked
      }

      let currentColor = window.getComputedStyle(this).backgroundColor;

      if (currentColor === selectedColor) {
        this.style.backgroundColor = ""; // Reset to original colour
      } else {
        this.style.backgroundColor = selectedColor;
      }
    });
  });

  // Prevent segment clicks from affecting the cell
  document.querySelectorAll(".segment").forEach(segment => {
    segment.addEventListener("click", function (event) {
      event.stopPropagation(); // Stop the event from reaching the table cell
    });
  });
});

//Trash icon clears all segments not within timetable
document.querySelector(".Trash-Container").addEventListener("click", () => {
  // Get all task segments inside .Task1, .Task2, ..., .Task10
  const taskSegments = document.querySelectorAll('.Task1 .segment, .Task2 .segment, .Task3 .segment, .Task4 .segment, .Task5 .segment, .Task6 .segment, .Task7 .segment, .Task8 .segment, .Task9 .segment, .Task10 .segment');

  // Collect task IDs of tasks that have segments in those containers
  const tasksToRemove = new Set();
  taskSegments.forEach(segment => {
    const taskId = segment.getAttribute("data-task-id");
    if (taskId) {
      tasksToRemove.add(taskId);
    }
  });

  // Remove all segments from task containers
  document.querySelectorAll('.Task1, .Task2, .Task3, .Task4, .Task5, .Task6, .Task7, .Task8, .Task9, .Task10')
    .forEach(container => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    });

  // Remove all segments from the timetable that belong to the removed tasks
  document.querySelectorAll(".dropzone .segment").forEach(segment => {
    const taskId = segment.getAttribute("data-task-id");
    if (taskId && tasksToRemove.has(taskId)) {
      segment.remove();
    }
  });

  // Remove tasks from the tasks array
  tasks = tasks.filter(task => !tasksToRemove.has(task.id));

// Remove segments from the timetable based on removed tasks
document.querySelectorAll(".dropzone").forEach(cell => {
  tasksToRemove.forEach(taskId => {
    const existingSegments = cell.querySelectorAll(`.segment[data-task-id='${taskId}']`);
    existingSegments.forEach(segment => segment.remove()); // Remove all matching segments
  });
});
});

function displayTaskSegments(task) {
  task.segments.forEach((segment, index) => {
    const taskContainer = document.querySelector(`.Task${index + 1}`);

    if (!taskContainer) {
      console.error(`Error: No task container found for Task${index + 1}`);
      return;
    }

    let segmentDiv = document.createElement("div");
    segmentDiv.classList.add("segment");
    
    //Assign task and segment IDs for drag-and-drop tracking
    segmentDiv.dataset.taskId = task.id;
    segmentDiv.dataset.segmentId = segment.segmentId;

    //Make segment draggable
    segmentDiv.draggable = true;

    let taskNameDiv = document.createElement("div");
    taskNameDiv.classList.add("task-name");
    taskNameDiv.textContent = task.name;

    let hourSplitDiv = document.createElement("div");
    hourSplitDiv.classList.add("hour-split");
    hourSplitDiv.textContent = `Duration: ${segment.duration}h`;

    segmentDiv.appendChild(taskNameDiv);
    segmentDiv.appendChild(hourSplitDiv);

    //Only add dropdown and complete button to first segment
    if (index === 0) {
      let categoryDropdown = document.createElement("select");
      categoryDropdown.classList.add("category-dropdown");

      // Retrieve existing categories
      const existingCategories = document.querySelectorAll(".categories-container .category-label input[type='text']");

      // Add a "None" option
      let optionNone = document.createElement("option");
      optionNone.value = "None";
      optionNone.textContent = "None";
      categoryDropdown.appendChild(optionNone);

      // Add all existing categories
      existingCategories.forEach(categoryInput => {
        let categoryName = categoryInput.value;
        let categoryColor = categoryInput.nextElementSibling.value; // Get color from color picker

        let categoryOption = document.createElement("option");
        categoryOption.value = categoryName;
        categoryOption.textContent = categoryName;
        categoryOption.dataset.color = categoryColor;

        categoryDropdown.appendChild(categoryOption);
      });

      let completeButton = document.createElement("button");
      completeButton.classList.add("complete-btn");
      completeButton.textContent = "Complete";

      completeButton.addEventListener("click", () => {
        deleteTask(task.id);
      });

      segmentDiv.appendChild(categoryDropdown);
      segmentDiv.appendChild(completeButton);
    }

    // Attach drag event for the segment
    segmentDiv.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", JSON.stringify({
        taskId: task.id,
        segmentId: segment.segmentId
      }));
    });

    taskContainer.appendChild(segmentDiv);
  });
}

//Enable dropzones to accept dropped segments
function enableDropzones() {
  document.querySelectorAll(".dropzone").forEach(dropzone => {
    dropzone.addEventListener("dragover", (event) => {
      // Check if the dropzone is green
      let bgColor = window.getComputedStyle(dropzone).backgroundColor;
      if (bgColor === "rgb(193, 219, 181)") { 
        event.preventDefault(); // Allow dropping only if it's green
        event.dataTransfer.dropEffect = "move"; // Visual indication
      }
    });

    dropzone.addEventListener("drop", (event) => {
      event.preventDefault(); // Prevent default action
      
      // Check again if the dropzone is green before proceeding
      let bgColor = window.getComputedStyle(event.target).backgroundColor;
      if (bgColor !== "rgb(193, 219, 181)") return; 

      // Get the dragged segment
      let segmentData = JSON.parse(event.dataTransfer.getData("text/plain"));
      let draggedSegment = document.querySelector(`.segment[data-task-id='${segmentData.taskId}'][data-segment-id='${segmentData.segmentId}']`);

      // Append the dragged segment to the dropzone
      if (draggedSegment) {
        dropzone.appendChild(draggedSegment);
        draggedSegment.style.position = "static";
        draggedSegment.style.marginBottom = '5px';
        draggedSegment.style.height = '120px';

        // Mark the segment as assigned in the task array
        let task = tasks.find(t => t.id === segmentData.taskId);
        if (task) {
          let segment = task.segments.find(s => s.segmentId === segmentData.segmentId);
          if (segment) {
            segment.assigned = true;
          }
        }
      }
      saveToLocalStorage();
    });
  });
};

// Function to update all dropdowns and segment colors when a category is added or modified
function updateAllDropdowns(categoryName, color, oldCategoryName = null) {
  document.querySelectorAll(".category-dropdown").forEach(dropdown => {
    let existingOption = dropdown.querySelector(`option[value="${oldCategoryName || categoryName}"]`);

    if (existingOption) {
      existingOption.value = categoryName;
      existingOption.textContent = categoryName;
      existingOption.dataset.color = color;
    } else {
      let newOption = document.createElement("option");
      newOption.value = categoryName;
      newOption.textContent = categoryName;
      newOption.dataset.color = color;
      dropdown.appendChild(newOption);
    }
  });

  // Update all segments with the new category color
  updateAllTaskSegments(categoryName, color);
}

// Function to update the color of all segments linked to a category
function updateAllTaskSegments(categoryName, color) {
  document.querySelectorAll(".segment").forEach(segment => {
    const taskId = segment.dataset.taskId; // Get task ID of the segment
    const firstSegmentDropdown = document.querySelector(`.segment[data-task-id='${taskId}'] .category-dropdown`);
    
    // If the first segment's dropdown matches the category, update all segments of that task
    if (firstSegmentDropdown && firstSegmentDropdown.value === categoryName) {
      segment.style.backgroundColor = color;
    }
  });
}

// Function to remove a category from all dropdowns when deleted
function removeCategoryFromDropdowns(categoryName) {
  document.querySelectorAll(".category-dropdown").forEach(dropdown => {
    const optionToRemove = dropdown.querySelector(`option[value="${categoryName}"]`);
    if (optionToRemove) {
      optionToRemove.remove();
    }
  });

  // Also reset background color of segments associated with the removed category
  document.querySelectorAll(".segment").forEach(segment => {
    const dropdown = segment.querySelector(".category-dropdown");
    if (dropdown && dropdown.value === categoryName) {
      segment.style.backgroundColor = ""; // Reset to default
    }
  });
}

// Category creation logic
document.getElementById("addCategoryBtn").addEventListener("click", function () {
  console.log("Add button was pressed!");

  const categoriesContainer = document.querySelector(".categories-container");

  if (categoriesContainer.children.length >= 4) {
    alert("You can only have up to 4 categories!");
    return;
  }

  // Create category label container
  const categoryLabel = document.createElement("div");
  categoryLabel.classList.add("category-label");

  // Create input field for category name
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter category name...";
  categoryLabel.appendChild(input);

  // Create color picker
  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.classList.add("category-color");
  categoryLabel.appendChild(colorPicker);

  // Create delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "✖";
  deleteBtn.classList.add("delete-btn");
  categoryLabel.appendChild(deleteBtn);

  categoriesContainer.appendChild(categoryLabel);

  input.focus();

  let oldCategoryName = "";

  // When user enters a category name, update dropdowns
  input.addEventListener("change", function () {
    if (input.value.trim() !== "") {
      if (oldCategoryName) {
        removeCategoryFromDropdowns(oldCategoryName);
      }
      updateAllDropdowns(input.value, colorPicker.value, oldCategoryName);
      oldCategoryName = input.value;
      categoryLabel.dataset.optionValue = input.value;
      categoryLabel.dataset.optionColor = colorPicker.value;
      saveToLocalStorage();
    }
  });

  // When user changes the color, update all task segments linked to this category
  colorPicker.addEventListener("input", function () {
    categoryLabel.dataset.optionColor = colorPicker.value;
    
    if (input.value.trim() !== "") {
      updateAllTaskSegments(input.value, colorPicker.value);
      saveToLocalStorage();
    }
  });

  // Remove category when delete button is clicked
  deleteBtn.addEventListener("click", () => {
    categoriesContainer.removeChild(categoryLabel);
    removeCategoryFromDropdowns(categoryLabel.dataset.optionValue);
    saveToLocalStorage();
  });
});

// Apply category color to all segments when the dropdown selection is changed
document.addEventListener("change", function (event) {
  if (event.target.classList.contains("category-dropdown")) {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const selectedCategory = selectedOption.value;
    const selectedColor = selectedOption.dataset.color;
    
    // Get the task ID of the segment containing this dropdown
    const segmentEl = event.target.closest('.segment');
    if (segmentEl) {
      const taskId = parseInt(segmentEl.dataset.taskId);
      
      // Update the task's category in the tasks array
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.category = selectedCategory;
      }
    }

    updateAllTaskSegments(selectedCategory, selectedColor);
    saveToLocalStorage();
  }
  saveToLocalStorage();
});

// Function to save all app data to localStorage
function saveToLocalStorage() {
  const dataToSave = {
    tasks: tasks,
    timetable: saveTimetableState(),
    categories: saveCategories()
  };
  
  localStorage.setItem('studySchedulerData', JSON.stringify(dataToSave));
}

// Function to load data from localStorage
function loadFromLocalStorage() {
  const savedData = localStorage.getItem('studySchedulerData');
  
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    
    // Restore tasks
    tasks = parsedData.tasks || [];
    
    // Display all tasks in the task list
    tasks.forEach(task => {
      displayTaskSegments(task);
    });
    
    // Restore categories
    if (parsedData.categories) {
      restoreCategories(parsedData.categories);
    }
    
    // Restore timetable state
    if (parsedData.timetable) {
      restoreTimetableState(parsedData.timetable);
    }
  }
}

// Helper function to save the current state of the timetable
function saveTimetableState() {
  const timetableState = [];
  
  // Save state of each cell in the timetable
  document.querySelectorAll('.dropzone').forEach(cell => {
    const cellId = cell.dataset.cellId;
    const backgroundColor = window.getComputedStyle(cell).backgroundColor;
    const segments = [];
    
    // Save segments in this cell
    cell.querySelectorAll('.segment').forEach(segment => {
      segments.push({
        taskId: segment.dataset.taskId,
        segmentId: segment.dataset.segmentId
      });
    });
    
    timetableState.push({
      cellId: cellId,
      backgroundColor: backgroundColor,
      segments: segments
    });
  });
  
  return timetableState;
}

// Helper function to restore the timetable state
function restoreTimetableState(timetableState) {
  timetableState.forEach(cellState => {
    const cell = document.querySelector(`.dropzone[data-cell-id="${cellState.cellId}"]`);
    
    if (cell) {
      // Restore background color (only if it's the selected green color)
      if (cellState.backgroundColor === 'rgb(193, 219, 181)') {
        cell.style.backgroundColor = 'rgb(193, 219, 181)';
      }
      
      // Restore segments
      cellState.segments.forEach(segmentData => {
        const taskId = parseInt(segmentData.taskId);
        const segmentId = parseInt(segmentData.segmentId);
        
        // Find the task and segment
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
          const segment = task.segments.find(s => s.segmentId === segmentId);
          
          if (segment) {
            // Mark the segment as assigned
            segment.assigned = true;
            
            // Find the segment element in the task containers
            const segmentElement = document.querySelector(`.segment[data-task-id="${taskId}"][data-segment-id="${segmentId}"]`);
            
            if (segmentElement) {
              // Move it to the cell
              cell.appendChild(segmentElement);
              segmentElement.style.position = "static";
              segmentElement.style.marginBottom = '5px';
              segmentElement.style.height = '120px';
            }
          }
        }
      });
    }
  });
  document.querySelectorAll('.segment').forEach(segmentEl => {
    const taskId = parseInt(segmentEl.dataset.taskId);
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.category && task.category !== "None") {
      // Find category color from any dropdown
      const anyDropdown = document.querySelector('.category-dropdown');
      if (anyDropdown) {
        const option = anyDropdown.querySelector(`option[value="${task.category}"]`);
        if (option && option.dataset.color) {
          segmentEl.style.backgroundColor = option.dataset.color;
        }
      }
    }
  });
}

// Helper function to save categories
function saveCategories() {
  const categories = [];
  
  document.querySelectorAll('.category-label').forEach(categoryLabel => {
    const nameInput = categoryLabel.querySelector('input[type="text"]');
    const colorPicker = categoryLabel.querySelector('input[type="color"]');
    
    if (nameInput && colorPicker && nameInput.value.trim() !== '') {
      categories.push({
        name: nameInput.value,
        color: colorPicker.value
      });
    }
  });
  
  return categories;
}

// Helper function to restore categories
function restoreCategories(categories) {
  const categoriesContainer = document.querySelector('.categories-container');
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  
  categories.forEach(category => {
    // Create category label container
    const categoryLabel = document.createElement("div");
    categoryLabel.classList.add("category-label");
    categoryLabel.dataset.optionValue = category.name;
    categoryLabel.dataset.optionColor = category.color;

    // Create input field for category name
    const input = document.createElement("input");
    input.type = "text";
    input.value = category.name;
    categoryLabel.appendChild(input);

    // Create color picker
    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.classList.add("category-color");
    colorPicker.value = category.color;
    categoryLabel.appendChild(colorPicker);

    // Create delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "✖";
    deleteBtn.classList.add("delete-btn");
    categoryLabel.appendChild(deleteBtn);

    categoriesContainer.appendChild(categoryLabel);

    // When user enters a category name, update dropdowns
    let oldCategoryName = category.name;
    input.addEventListener("change", function () {
      if (input.value.trim() !== "") {
        if (oldCategoryName) {
          removeCategoryFromDropdowns(oldCategoryName);
        }
        updateAllDropdowns(input.value, colorPicker.value, oldCategoryName);
        oldCategoryName = input.value;
        categoryLabel.dataset.optionValue = input.value;
        categoryLabel.dataset.optionColor = colorPicker.value;
        saveToLocalStorage();
      }
    });

    colorPicker.addEventListener("input", function () {
      categoryLabel.dataset.optionColor = colorPicker.value;
      
      if (input.value.trim() !== "") {
        updateAllTaskSegments(input.value, colorPicker.value);
        saveToLocalStorage();
      }
    });

    // Remove category when delete button is clicked
    deleteBtn.addEventListener("click", () => {
      categoriesContainer.removeChild(categoryLabel);
      removeCategoryFromDropdowns(categoryLabel.dataset.optionValue);
      saveToLocalStorage();
    });
    
    // Update all dropdown menus with this category
    updateAllDropdowns(category.name, category.color);
  });
}