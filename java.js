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

      // Wait for 2 seconds, then remove the elements
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


const TaskName = document.querySelector('.TaskName-input');
const icon = document.querySelector('.TaskName-icon');
const NoTaskName = document.querySelector('.NoTaskName');

icon.addEventListener('click', () => {
  if (TaskName.value.trim() === '') {
    NoTaskName.style.visibility = 'visible';
  } else {
    NoTaskName.style.visibility = 'hidden';
    taskNameInputted = true;
  }
});

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

document.addEventListener("DOMContentLoaded", function () {
  const cells = document.querySelectorAll(".timetable-grid td:not(:first-child)");
  const selectedColor = "rgb(193, 219, 181)"; 

  cells.forEach(cell => {
    cell.addEventListener("click", function () {
      let currentColor = window.getComputedStyle(this).backgroundColor;

      if (currentColor === selectedColor) {
        this.style.backgroundColor = ""; // Resets to original
      } else {
        this.style.backgroundColor = selectedColor;
      }
    });
  });
});