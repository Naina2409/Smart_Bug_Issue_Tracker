/* js/board.js - Kanban Board Logic */

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderBoard() {
    const bugs = getBugs();
    
    // Filter bugs by status
    const openBugs = bugs.filter(b => b.status === 'open');
    const progressBugs = bugs.filter(b => b.status === 'in-progress');
    const resolvedBugs = bugs.filter(b => b.status === 'resolved');
    
    // Update column counts
    const openCount = document.getElementById('openCount');
    const progressCount = document.getElementById('progressCount');
    const resolvedCount = document.getElementById('resolvedCount');
    
    if (openCount) openCount.textContent = openBugs.length;
    if (progressCount) progressCount.textContent = progressBugs.length;
    if (resolvedCount) resolvedCount.textContent = resolvedBugs.length;
    
    // Render columns
    const openColumn = document.getElementById('openColumn');
    const progressColumn = document.getElementById('progressColumn');
    const resolvedColumn = document.getElementById('resolvedColumn');
    
    if (openColumn) {
        openColumn.innerHTML = renderBugCards(openBugs, 'open');
    }
    if (progressColumn) {
        progressColumn.innerHTML = renderBugCards(progressBugs, 'in-progress');
    }
    if (resolvedColumn) {
        resolvedColumn.innerHTML = renderBugCards(resolvedBugs, 'resolved');
    }
}

function renderBugCards(bugs, currentStatus) {
    if (bugs.length === 0) {
        return '<div class="empty-message" style="padding: 40px; text-align: center; color: #888;">No bugs in this column</div>';
    }
    
    return bugs.map(bug => `
        <div class="board-card" onclick="updateBugStatus('${bug.id}', '${currentStatus}')">
            <div class="board-card-header">
                <span class="board-id">${escapeHtml(bug.id)}</span>
                <div class="board-priority priority-${bug.priority}" style="width: 10px; height: 10px; border-radius: 10px;"></div>
            </div>
            <div class="board-title">${escapeHtml(bug.title)}</div>
            <div class="board-footer">
                <span>👤 ${escapeHtml(bug.assignee || 'Unassigned')}</span>
                <span>📅 ${new Date(bug.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

function updateBugStatus(bugId, currentStatus) {
    let newStatus = '';
    
    if (currentStatus === 'open') {
        newStatus = prompt('Change status to:', 'in-progress');
    } else if (currentStatus === 'in-progress') {
        newStatus = prompt('Change status to (open/in-progress/resolved):', 'resolved');
    } else {
        newStatus = prompt('Change status to (open/in-progress/resolved):', currentStatus);
    }
    
    if (newStatus && ['open', 'in-progress', 'resolved'].includes(newStatus.toLowerCase())) {
        updateBug(bugId, { status: newStatus.toLowerCase() });
        renderBoard();
        // Update dashboard if visible
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
    } else if (newStatus) {
        alert('Invalid status! Please enter: open, in-progress, or resolved');
    }
}

// Initialize board when page loads
document.addEventListener('DOMContentLoaded', function() {
    renderBoard();
});