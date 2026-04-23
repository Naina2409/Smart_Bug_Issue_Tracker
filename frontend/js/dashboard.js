/* js/dashboard.js - Dashboard Page Logic */

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateDashboard() {
    const stats = getStats();
    const bugs = getBugs();
    
    console.log('📊 Dashboard updating with', bugs.length, 'bugs');
    
    // Update stats cards
    const statsContainer = document.getElementById('statsContainer');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon" style="background:#fee2e2; color:#dc2626;">🐛</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.open}</div>
                    <div class="stat-label">Open Bugs</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:#fed7aa; color:#f97316;">⚙️</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.inProgress}</div>
                    <div class="stat-label">In Progress</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:#d1fae5; color:#10b981;">✅</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.resolved}</div>
                    <div class="stat-label">Resolved</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:#e0e7ff; color:#6366f1;">📊</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Total Bugs</div>
                </div>
            </div>
        `;
    }
    
    // Recent bugs
    const recentContainer = document.getElementById('recentBugsList');
    if (recentContainer) {
        const recentBugs = bugs.slice(0, 5);
        if (recentBugs.length === 0) {
            recentContainer.innerHTML = '<div class="empty-message" style="padding: 40px;">No bugs reported yet. Click "Report Bug" to create one!</div>';
        } else {
            recentContainer.innerHTML = recentBugs.map(bug => `
                <div class="bug-item" onclick="window.location.href='list.html'">
                    <div class="bug-priority priority-${bug.priority}"></div>
                    <div class="bug-info">
                        <span class="bug-id">${escapeHtml(bug.id)}</span>
                        <span class="bug-title">${escapeHtml(bug.title)}</span>
                    </div>
                    <span class="bug-status status-${bug.status === 'in-progress' ? 'in-progress' : bug.status}">${bug.status === 'in-progress' ? 'In Progress' : (bug.status === 'open' ? 'Open' : 'Resolved')}</span>
                </div>
            `).join('');
        }
    }
    
    // Priority chart
    const priorityData = [
        { label: 'Critical', count: stats.critical, color: '#ef4444' },
        { label: 'High', count: stats.high, color: '#f97316' },
        { label: 'Medium', count: stats.medium, color: '#eab308' },
        { label: 'Low', count: stats.low, color: '#10b981' }
    ];
    const maxCount = Math.max(...priorityData.map(p => p.count), 1);
    const chartContainer = document.getElementById('priorityChart');
    if (chartContainer) {
        chartContainer.innerHTML = priorityData.map(p => `
            <div class="priority-row">
                <span class="priority-label">${p.label}</span>
                <div class="priority-bar-container">
                    <div class="priority-bar" style="width: ${(p.count / maxCount) * 100}%; background: ${p.color};"></div>
                </div>
                <span class="priority-count">${p.count}</span>
            </div>
        `).join('');
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard page loaded');
    // Initial update
    updateDashboard();
    
    // Also update after 1 second to ensure data is loaded
    setTimeout(() => {
        updateDashboard();
    }, 500);
    
    // And again after 2 seconds
    setTimeout(() => {
        updateDashboard();
    }, 1000);
});