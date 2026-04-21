/* js/list.js - All Issues List Logic */

let currentBugs = [];

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderIssuesTable() {
    const priorityFilter = document.getElementById('filterPriority')?.value || 'all';
    const statusFilter = document.getElementById('filterStatus')?.value || 'all';
    
    let bugs = getBugs();
    
    // Apply filters
    if (priorityFilter !== 'all') {
        bugs = bugs.filter(b => b.priority === priorityFilter);
    }
    if (statusFilter !== 'all') {
        bugs = bugs.filter(b => b.status === statusFilter);
    }
    
    currentBugs = bugs;
    
    const tbody = document.getElementById('issuesList');
    const emptyMessage = document.getElementById('emptyMessage');
    
    if (!tbody) return;
    
    if (bugs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No bugs found</td></tr>';
        if (emptyMessage) emptyMessage.style.display = 'block';
        return;
    }
    
    if (emptyMessage) emptyMessage.style.display = 'none';
    
    tbody.innerHTML = bugs.map(bug => `
        <tr>
            <td><strong>${escapeHtml(bug.id)}</strong></td>
            <td>${escapeHtml(bug.title)}</td>
            <td><span class="bug-priority priority-${bug.priority}" style="display: inline-block; width: 10px; height: 10px; border-radius: 10px; margin-right: 8px;"></span>${bug.priority.toUpperCase()}</td>
            <td><span class="bug-status status-${bug.status === 'in-progress' ? 'in-progress' : bug.status}">${bug.status === 'in-progress' ? 'In Progress' : bug.status.charAt(0).toUpperCase() + bug.status.slice(1)}</span></td>
            <td>${escapeHtml(bug.assignee || 'Unassigned')}</td>
            <td>${new Date(bug.createdAt).toLocaleDateString()}</td>
            <td class="action-buttons">
                <button class="edit-link" onclick="openEditModal('${bug.id}')">✏️ Edit</button>
                <button class="delete-link" onclick="deleteBugById('${bug.id}')">🗑️ Delete</button>
            </td>
        </tr>
    `).join('');
}

function openEditModal(bugId) {
    const bugs = getBugs();
    const bug = bugs.find(b => b.id === bugId);
    if (!bug) return;
    
    // Populate modal
    document.getElementById('editId').value = bug.id;
    document.getElementById('editTitle').value = bug.title;
    document.getElementById('editDesc').value = bug.description || '';
    document.getElementById('editPriority').value = bug.priority;
    document.getElementById('editStatus').value = bug.status;
    document.getElementById('editAssignee').value = bug.assignee || 'Unassigned';
    
    // Show modal
    const modal = document.getElementById('editModal');
    if (modal) modal.style.display = 'flex';
}

function deleteBugById(bugId) {
    if (confirm('Are you sure you want to delete this bug?')) {
        deleteBug(bugId);
        renderIssuesTable();
        // Update dashboard stats if visible
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
    }
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', function() {
    renderIssuesTable();
    
    // Filter listeners
    const priorityFilter = document.getElementById('filterPriority');
    const statusFilter = document.getElementById('filterStatus');
    const clearBtn = document.getElementById('clearFiltersBtn');
    
    if (priorityFilter) priorityFilter.addEventListener('change', renderIssuesTable);
    if (statusFilter) statusFilter.addEventListener('change', renderIssuesTable);
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (priorityFilter) priorityFilter.value = 'all';
            if (statusFilter) statusFilter.value = 'all';
            renderIssuesTable();
        });
    }
    
    // Modal close
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.querySelector('.modal-cancel');
    
    if (closeBtn) {
        closeBtn.onclick = () => { if (modal) modal.style.display = 'none'; };
    }
    if (cancelBtn) {
        cancelBtn.onclick = () => { if (modal) modal.style.display = 'none'; };
    }
    
    // Close modal when clicking outside
    window.onclick = function(e) {
        if (e.target === modal) modal.style.display = 'none';
    };
    
    // Edit form submit
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('editId').value;
            const updates = {
                title: document.getElementById('editTitle').value,
                description: document.getElementById('editDesc').value,
                priority: document.getElementById('editPriority').value,
                status: document.getElementById('editStatus').value,
                assignee: document.getElementById('editAssignee').value
            };
            updateBug(id, updates);
            if (modal) modal.style.display = 'none';
            renderIssuesTable();
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
        });
    }
});