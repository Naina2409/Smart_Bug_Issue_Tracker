/* js/report.js - Fixed Version */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Report page loaded');
    
    const form = document.getElementById('bugForm');
    const messageDiv = document.getElementById('formMessage');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('title').value.trim();
            const priority = document.getElementById('priority').value;
            const status = document.getElementById('status').value;
            const description = document.getElementById('description').value.trim();
            const assignee = document.getElementById('assignee').value;
            
            console.log('Form submitted with:', { title, priority, status, description, assignee });
            
            if (!title) {
                showMessage('Please enter a bug title', 'error');
                return;
            }
            if (!description) {
                showMessage('Please enter a bug description', 'error');
                return;
            }
            
            const newBug = { title, priority, status, description, assignee };
            
            try {
                // Check if addBug function exists
                if (typeof addBug !== 'function') {
                    console.error('addBug function not found!');
                    showMessage('System error: Bug service not available', 'error');
                    return;
                }
                
                const savedBug = await addBug(newBug);
                console.log('Saved bug result:', savedBug);
                
                if (savedBug && savedBug.id) {
                    showMessage(`Bug ${savedBug.id} created successfully! Redirecting...`, 'success');
                    form.reset();
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    showMessage('Failed to create bug. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Error creating bug:', error);
                showMessage('Error creating bug: ' + error.message, 'error');
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