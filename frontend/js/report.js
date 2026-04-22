/* js/report.js */
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('bugForm');
    const messageDiv = document.getElementById('formMessage');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('title').value.trim();
            const priority = document.getElementById('priority').value;
            const status = document.getElementById('status').value;
            const description = document.getElementById('description').value.trim();
            const assignee = document.getElementById('assignee').value;
            
            if (!title || !description) {
                showMessage('Please fill in all required fields', 'error');
                return;
            }
            
            const newBug = { title, priority, status, description, assignee };
            const savedBug = addBug(newBug);
            
            if (savedBug) {
                showMessage(`Bug ${savedBug.id} created successfully!`, 'success');
                form.reset();
                setTimeout(() => {
                    showDashboard();
                    updateDashboard();
                    renderBoard();
                    renderIssuesTable();
                }, 1500);
            } else {
                showMessage('Failed to create bug', 'error');
            }
        });
    }
    
    function showMessage(msg, type) {
        if (messageDiv) {
            messageDiv.textContent = msg;
            messageDiv.className = `form-message ${type}`;
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = 'form-message';
            }, 3000);
        }
    }
});