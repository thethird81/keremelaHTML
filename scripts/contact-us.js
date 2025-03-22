// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function() {
    var form = document.querySelector('form');  // Select the form element
    var submitButton = form.querySelector('button[type="submit"]'); // Submit button
    var messageBox = document.querySelector('.message'); // For displaying messages

    // Add event listener for form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the values from the form fields
        var name = form.querySelector('input[name="name"]').value;
        var email = form.querySelector('input[name="email"]').value;
        var message = form.querySelector('textarea[name="message"]').value;

        // Check if any of the fields are empty
        if (!name || !email || !message) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        // Prepare data to send to Web3Forms
        var formData = new FormData();
        formData.append('access_key', '72f8a83b-782a-4973-b92c-beea78b2a4b8'); // Replace with your actual Web3Forms API access key
        formData.append('name', name);
        formData.append('email', email);
        formData.append('message', message);

        // Send the form data via Fetch API
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.web3forms.com/submit', true);

        // Set up event listener for when the request completes
        xhr.onload = function () {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                if (data.success) {
                    showMessage('Your message has been sent successfully!', 'success');
                    form.reset(); // Reset form after successful submission
                } else {
                    showMessage('Something went wrong. Please try again later.', 'error');
                }
            } else {
                showMessage('An error occurred. Please try again later.', 'error');
            }
        };

        // Send the request with the form data
        xhr.send(formData);
    });

    // Function to show messages
    function showMessage(message, type) {
        messageBox.textContent = message;
        if (type === 'error') {
            messageBox.style.color = '#e74c3c'; // Red for error
        } else {
            messageBox.style.color = '#2ecc71'; // Green for success
        }
        messageBox.style.display = 'block';
    }
});
