document.querySelector('.info-link').addEventListener('click', function (event) {
    const infoDiv = document.querySelector('.information');
    infoDiv.classList.toggle('active'); // Toggle the 'active' class
    infoDiv.classList.remove('hidden'); // Ensure it's visible
  });
  
  document.addEventListener('DOMContentLoaded', function() {
    const homepage = document.querySelector('.homepage');

    document.querySelector('.cta-button').addEventListener('click', function () {
        console.log('Button clicked!'); // Log when the button is clicked
        homepage.classList.add('hidden-up'); // Add the class to move the container off-screen
        

    });
});