/* js/report.js */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Report page loaded'); // Check if script runs
    
    const form = document.getElementById('bugForm');
    const messageDiv = document.getElementById('formMessage');
    
    if (form) {
        console.log('Form found, attaching event listener');
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            // Get form values
            const title = document.getElementById('title').value.trim();
            const priority = document.getElementById('priority').value;
            const status = document.getElementById('status').value;
            const description = document.getElementById('description').value.trim();
            const assignee = document.getElementById('assignee').value;
            
            console.log('Title:', title, 'Priority:', priority);
            
            // Validate
            if (!title) {
                showMessage('Please enter a bug title', 'error');
                return;
            }
            if (!description) {
                showMessage('Please enter a bug description', 'error');
                return;
            }
            
            // Create bug object
            const newBug = {
                title: title,
                priority: priority,
                status: status,
                description: description,
                assignee: assignee
            };
            
            // Add to storage
            const savedBug = addBug(newBug);
            console.log('Saved bug:', savedBug);
            
            if (savedBug) {
                showMessage(`Bug ${savedBug.id} created successfully! Redirecting...`, 'success');
                form.reset();
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showMessage('Failed to create bug. Please try again.', 'error');
            }
        });
    } else {
        console.error('Form not found! Check if id="bugForm" exists');
    }
    
    function showMessage(msg, type) {
        if (messageDiv) {
            messageDiv.textContent = msg;
            messageDiv.className = `form-message ${type}`;
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = 'form-message';
            }, 3000);
        } else {
            alert(msg);
        }
    }
});