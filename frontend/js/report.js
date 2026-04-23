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
// In report.js - after saving bug
if (savedBug) {
    // Add message about new bug
    addMessage(`🐛 NEW BUG: ${savedBug.id} "${savedBug.title}" reported with ${savedBug.priority} priority`, 'info');
    addMessage(`📋 Bug ${savedBug.id} assigned to ${savedBug.assignee || 'Unassigned'}`, 'info');
    
    // Simulate developer getting notified
    if (savedBug.assignee !== 'Unassigned') {
        addMessage(`🔔 Notification sent to ${savedBug.assignee} about ${savedBug.id}`, 'success');
    }
    
    showMessage(`Bug ${savedBug.id} created successfully!`, 'success');
    // ... rest of code
}