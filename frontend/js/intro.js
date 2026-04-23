/* js/intro.js - Complete with Auto-Resolved Bug Detection */

// ========== TYPEWRITER FUNCTION ==========
function startTypewriter() {
    console.log('Starting typewriter...');
    
    const introScreen = document.getElementById('introScreen');
    const loginScreen = document.getElementById('loginScreen');
    const typewriterElement = document.getElementById('typewriterText');
    
    if (!typewriterElement) {
        console.error('Typewriter element not found!');
        return;
    }
    
    const textToType = "MINI JIRA";
    let index = 0;
    typewriterElement.textContent = '';
    
    function typeWriter() {
        if (index < textToType.length) {
            typewriterElement.textContent += textToType.charAt(index);
            index++;
            setTimeout(typeWriter, 150);
        } else {
            console.log('Typing complete!');
            const cursor = document.querySelector('.cursor');
            if (cursor) cursor.style.opacity = '0';
            
            setTimeout(function() {
                if (introScreen) {
                    introScreen.style.opacity = '0';
                    introScreen.style.transition = 'opacity 1s';
                    setTimeout(function() {
                        introScreen.style.display = 'none';
                        if (loginScreen) loginScreen.style.display = 'flex';
                        localStorage.setItem('introShown', 'true');
                    }, 1000);
                }
            }, 800);
        }
    }
    
    typeWriter();
}

// ========== MESSAGE SYSTEM ==========
function addMessage(message, type = 'info') {
    const messages = JSON.parse(localStorage.getItem('activity_messages') || '[]');
    messages.unshift({
        id: Date.now(),
        text: message,
        type: type,
        timestamp: new Date().toLocaleTimeString()
    });
    localStorage.setItem('activity_messages', JSON.stringify(messages.slice(0, 50)));
    displayMessages();
}

function displayMessages() {
    const messageList = document.getElementById('messageList');
    if (!messageList) return;
    
    const messages = JSON.parse(localStorage.getItem('activity_messages') || '[]');
    
    if (messages.length === 0) {
        messageList.innerHTML = '<div class="message-item">💬 No recent activity. Report a bug to start!</div>';
        return;
    }
    
    messageList.innerHTML = messages.map(msg => `
        <div class="message-item" style="border-left-color: ${msg.type === 'success' ? '#10b981' : (msg.type === 'critical' ? '#ef4444' : '#0ea5e9')}">
            <strong>${msg.timestamp}</strong> - ${msg.text}
        </div>
    `).join('');
}

function clearMessages() {
    localStorage.setItem('activity_messages', '[]');
    displayMessages();
    addMessage("🧹 Message board cleared", 'info');
}

// ========== RESOLVED BUG DETECTION & NOTIFICATION ==========
let lastCheckedBugs = [];
let resolveMonitorInterval = null;

function checkForResolvedBugs() {
    const currentBugs = getBugs();
    const resolvedBugs = currentBugs.filter(bug => bug.status === 'resolved');
    const previouslyResolved = lastCheckedBugs.filter(bug => bug.status === 'resolved');
    
    // Find newly resolved bugs
    const newlyResolved = resolvedBugs.filter(resolvedBug => 
        !previouslyResolved.some(prev => prev.id === resolvedBug.id)
    );
    
    // Notify about newly resolved bugs
    newlyResolved.forEach(bug => {
        const message = `✅ RESOLVED: Bug ${bug.id} "${bug.title}" has been fixed by ${bug.assignee || 'the team'}!`;
        addMessage(message, 'success');
        showResolvedNotification(bug);
    });
    
    // Also check for critical bugs that need attention
    const criticalBugs = currentBugs.filter(bug => 
        bug.priority === 'critical' && 
        bug.status !== 'resolved'
    );
    
    criticalBugs.forEach(bug => {
        const bugAge = new Date() - new Date(bug.createdAt);
        const bugAgeMinutes = Math.floor(bugAge / 60000);
        
        const recentReminder = JSON.parse(localStorage.getItem('activity_messages') || '[]')
            .some(msg => msg.text.includes(bug.id) && msg.text.includes('reminder'));
        
        if (bugAgeMinutes > 2 && !recentReminder) {
            addMessage(`🚨 CRITICAL: Bug ${bug.id} "${bug.title}" still unresolved after ${bugAgeMinutes} minutes!`, 'critical');
        }
    });
    
    lastCheckedBugs = JSON.parse(JSON.stringify(currentBugs));
}

function showResolvedNotification(bug) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'resolve-notification';
    notification.innerHTML = `
        <div class="resolve-notification-content">
            <div class="resolve-icon">✅</div>
            <div class="resolve-text">
                <strong>Bug Resolved!</strong>
                <p>${bug.id}: ${bug.title.substring(0, 50)}</p>
                <small>Resolved by ${bug.assignee || 'Team'} • ${new Date().toLocaleTimeString()}</small>
            </div>
            <button onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Auto remove after 8 seconds
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (notification && notification.parentElement) notification.remove();
            }, 500);
        }
    }, 8000);
    
    // Also update the board if visible
    if (typeof renderBoard === 'function') renderBoard();
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof renderIssuesTable === 'function') renderIssuesTable();
}

function startResolveMonitor() {
    if (resolveMonitorInterval) clearInterval(resolveMonitorInterval);
    
    // Initialize with current bugs
    lastCheckedBugs = JSON.parse(JSON.stringify(getBugs()));
    
    // Check every 8 seconds for resolved bugs
    resolveMonitorInterval = setInterval(() => {
        checkForResolvedBugs();
        // Refresh UI to show updated status
        if (typeof renderBoard === 'function') renderBoard();
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof renderIssuesTable === 'function') renderIssuesTable();
    }, 8000);
}

function stopResolveMonitor() {
    if (resolveMonitorInterval) {
        clearInterval(resolveMonitorInterval);
        resolveMonitorInterval = null;
    }
}

// ========== AUTO MESSAGE SIMULATOR ==========
let autoMessageInterval = null;

function startAutoMessages() {
    if (autoMessageInterval) clearInterval(autoMessageInterval);
    
    autoMessageInterval = setInterval(function() {
        const bugs = getBugs();
        const messages = JSON.parse(localStorage.getItem('activity_messages') || '[]');
        
        const criticalBugs = bugs.filter(bug => 
            bug.priority === 'critical' && 
            bug.status !== 'resolved'
        );
        
        const now = new Date();
        
        criticalBugs.forEach(bug => {
            const bugAge = new Date(now) - new Date(bug.createdAt);
            const bugAgeMinutes = Math.floor(bugAge / 60000);
            
            const recentReminder = messages.some(msg => 
                msg.text.includes(bug.id) && msg.text.includes('reminder')
            );
            
            if (bugAgeMinutes > 2 && !recentReminder) {
                addMessage(`🚨 URGENT: Bug ${bug.id} "${bug.title}" is CRITICAL and unresolved!`, 'critical');
                addMessage(`📢 Assigned to ${bug.assignee || 'Unassigned'} - Please investigate!`, 'critical');
            }
        });
        
        // Auto-resolve after 5 minutes for demo
        criticalBugs.forEach(bug => {
            const bugAge = new Date(now) - new Date(bug.createdAt);
            const bugAgeMinutes = Math.floor(bugAge / 60000);
            
            const alreadyResolvedMsg = messages.some(msg => 
                msg.text.includes(bug.id) && msg.text.includes('RESOLVED')
            );
            
            if (bugAgeMinutes > 5 && bug.status !== 'resolved' && !alreadyResolvedMsg) {
                addMessage(`✅ Bug ${bug.id} "${bug.title}" has been auto-resolved!`, 'success');
                updateBug(bug.id, { status: 'resolved', updatedAt: new Date().toISOString() });
                if (typeof renderBoard === 'function') renderBoard();
                if (typeof updateDashboard === 'function') updateDashboard();
                if (typeof renderIssuesTable === 'function') renderIssuesTable();
            }
        });
    }, 30000);
}

function stopAutoMessages() {
    if (autoMessageInterval) {
        clearInterval(autoMessageInterval);
        autoMessageInterval = null;
    }
}

// ========== MESSAGE FUNCTIONS FOR BUG ACTIONS ==========
function onBugReported(bug) {
    const priorityEmoji = {
        'critical': '🔴 CRITICAL',
        'high': '🟠 HIGH',
        'medium': '🟡 MEDIUM',
        'low': '🟢 LOW'
    };
    
    addMessage(`🐛 NEW BUG: ${bug.id} "${bug.title}" (${priorityEmoji[bug.priority]})`, 
               bug.priority === 'critical' ? 'critical' : 'info');
    addMessage(`📋 Assigned to: ${bug.assignee || 'Unassigned'}`, 'info');
    
    if (bug.priority === 'critical') {
        addMessage(`🚨 CRITICAL BUG ALERT! Immediate attention required!`, 'critical');
    }
}

function onBugStatusChanged(bugId, oldStatus, newStatus, assignee) {
    const statusEmoji = {
        'open': '🟡',
        'in-progress': '⚙️',
        'resolved': '✅'
    };
    
    addMessage(`${statusEmoji[newStatus]} Bug ${bugId} status changed: ${oldStatus} → ${newStatus}`, 'info');
    
    if (newStatus === 'resolved') {
        addMessage(`🎉 EXCELLENT! Bug ${bugId} has been RESOLVED by ${assignee || 'Team'}!`, 'success');
    }
}

// ========== NOTIFICATION STYLES ==========
function addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .resolve-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
        }
        
        .resolve-notification-content {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            border-radius: 16px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            border-left: 4px solid #10b981;
        }
        
        .resolve-icon {
            font-size: 2rem;
        }
        
        .resolve-text {
            flex: 1;
        }
        
        .resolve-text strong {
            color: #065f46;
            font-size: 0.9rem;
        }
        
        .resolve-text p {
            color: #0f172a;
            font-size: 0.85rem;
            margin: 4px 0;
        }
        
        .resolve-text small {
            color: #047857;
            font-size: 0.7rem;
        }
        
        .resolve-notification-content button {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: #065f46;
            font-weight: bold;
        }
        
        .resolve-notification-content button:hover {
            opacity: 0.7;
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .message-list {
            max-height: 250px;
            overflow-y: auto;
        }
        
        .message-item {
            padding: 10px 12px;
            background: #f0f9ff;
            border-radius: 12px;
            margin-bottom: 8px;
            font-size: 0.85rem;
            border-left: 4px solid #0ea5e9;
            animation: fadeInUp 0.3s ease;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .notification-panel {
            background: white;
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 24px;
            border: 1px solid #bae6fd;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        .notification-panel h3 {
            margin-bottom: 15px;
            color: #0c4a6e;
            font-size: 1.1rem;
        }
    `;
    document.head.appendChild(style);
}

// ========== INITIALIZE MESSAGE BOARD ==========
function initMessageBoard() {
    const dashboardView = document.getElementById('dashboardView');
    if (dashboardView && !document.getElementById('messageList')) {
        const messageBoardHTML = `
            <div class="notification-panel">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3>📬 Resolved Bugs & Activity Feed</h3>
                    <button onclick="clearMessages()" style="background: none; border: none; color: #0ea5e9; cursor: pointer; font-size: 0.8rem;">Clear All</button>
                </div>
                <div id="messageList" class="message-list"></div>
                <div style="margin-top: 10px; font-size: 0.7rem; color: #64748b; display: flex; gap: 15px; flex-wrap: wrap;">
                    <span>✅ Green = Bug Resolved</span>
                    <span>🔴 Red = Critical Alert</span>
                    <span>🔵 Blue = Status Update</span>
                    <span>⏰ Checks every 8 seconds</span>
                </div>
            </div>
        `;
        dashboardView.insertAdjacentHTML('afterbegin', messageBoardHTML);
    }
    displayMessages();
    addNotificationStyles();
    startResolveMonitor();
    startAutoMessages();
}

// ========== INTERCEPT BUG ACTIONS ==========
const originalAddBug = window.addBug;
const originalUpdateBug = window.updateBug;

if (typeof addBug === 'function') {
    window.addBug = function(bugData) {
        const result = originalAddBug(bugData);
        if (result) onBugReported(result);
        return result;
    };
}

if (typeof updateBug === 'function') {
    window.updateBug = function(id, updates) {
        const bugs = getBugs();
        const oldBug = bugs.find(b => b.id === id);
        const result = originalUpdateBug(id, updates);
        
        if (result && updates.status && oldBug && oldBug.status !== updates.status) {
            onBugStatusChanged(id, oldBug.status, updates.status, updates.assignee || oldBug.assignee);
            
            // If resolved, show immediate notification
            if (updates.status === 'resolved') {
                const updatedBug = { ...oldBug, ...updates, id: id };
                showResolvedNotification(updatedBug);
            }
        }
        
        // Refresh UI
        setTimeout(() => {
            if (typeof renderBoard === 'function') renderBoard();
            if (typeof updateDashboard === 'function') updateDashboard();
            if (typeof renderIssuesTable === 'function') renderIssuesTable();
        }, 100);
        
        return result;
    };
}

// ========== DEMO SCENARIO ==========
function runDemoScenario() {
    addMessage("🎬 STARTING DEMO: Critical bug simulation", "success");
    
    setTimeout(() => {
        const demoBug = {
            title: "Payment Gateway Crash - Users cannot checkout",
            priority: "critical",
            status: "open",
            description: "Payment page crashes when users enter card details",
            assignee: "Sarah"
        };
        const savedBug = originalAddBug(demoBug);
        addMessage(`🔴 DEMO: Critical bug ${savedBug.id} created - Payment Gateway Crash`, "critical");
    }, 1000);
    
    setTimeout(() => {
        addMessage(`⚙️ Developer Sarah acknowledged and started working on the critical bug`, "info");
        const bugs = getBugs();
        const criticalBug = bugs.find(b => b.title?.includes("Payment"));
        if (criticalBug) originalUpdateBug(criticalBug.id, { status: 'in-progress' });
    }, 4000);
    
    setTimeout(() => {
        addMessage(`✅ CRITICAL BUG RESOLVED! Fix deployed successfully.`, "success");
        const bugs = getBugs();
        const criticalBug = bugs.find(b => b.title?.includes("Payment"));
        if (criticalBug) originalUpdateBug(criticalBug.id, { status: 'resolved' });
    }, 7000);
    
    setTimeout(() => {
        addMessage(`🎉 DEMO COMPLETE! Check your board - the bug is now resolved!`, "success");
    }, 9000);
}

function addDemoButton() {
    const headerRight = document.querySelector('#dashboardView .header-right');
    if (headerRight && !document.getElementById('demoBtn')) {
        const demoBtn = document.createElement('button');
        demoBtn.id = 'demoBtn';
        demoBtn.className = 'btn btn-secondary';
        demoBtn.innerHTML = '🎬 Run Demo';
        demoBtn.onclick = runDemoScenario;
        headerRight.appendChild(demoBtn);
    }
}

// ========== CLEANUP FUNCTION ==========
function stopAllMonitors() {
    stopResolveMonitor();
    stopAutoMessages();
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing MINI JIRA...');
    
    const introScreen = document.getElementById('introScreen');
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const introShown = localStorage.getItem('introShown');
    
    // Already logged in - show dashboard
    if (isLoggedIn === 'true') {
        if (introScreen) introScreen.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof renderBoard === 'function') renderBoard();
        setTimeout(() => {
            initMessageBoard();
            addDemoButton();
        }, 500);
        return;
    }
    
    // Intro shown but not logged in - show login
    if (introShown === 'true') {
        if (introScreen) introScreen.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
        return;
    }
    
    // First time - show typewriter
    if (mainApp) mainApp.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'none';
    if (introScreen) introScreen.style.display = 'flex';
    
    setTimeout(startTypewriter, 300);
});

// Login handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (email && password) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', email);
                
                const loginScreen = document.getElementById('loginScreen');
                const mainApp = document.getElementById('mainApp');
                
                if (loginScreen) loginScreen.style.display = 'none';
                if (mainApp) mainApp.style.display = 'flex';
                
                if (typeof updateDashboard === 'function') updateDashboard();
                if (typeof renderBoard === 'function') renderBoard();
                
                setTimeout(() => {
                    initMessageBoard();
                    addDemoButton();
                }, 500);
            } else {
                alert('Please enter email and password');
            }
        });
    }
});

// Navigation functions
function showDashboard() {
    document.getElementById('dashboardView').style.display = 'block';
    document.getElementById('reportView').style.display = 'none';
    document.getElementById('boardView').style.display = 'none';
    document.getElementById('listView').style.display = 'none';
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof renderBoard === 'function') renderBoard();
    
    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.classList.remove('active');
        if (i === 0) item.classList.add('active');
    });
}

function showReport() {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('reportView').style.display = 'block';
    document.getElementById('boardView').style.display = 'none';
    document.getElementById('listView').style.display = 'none';
    
    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.classList.remove('active');
        if (i === 1) item.classList.add('active');
    });
}

function showBoard() {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('reportView').style.display = 'none';
    document.getElementById('boardView').style.display = 'block';
    document.getElementById('listView').style.display = 'none';
    if (typeof renderBoard === 'function') renderBoard();
    
    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.classList.remove('active');
        if (i === 2) item.classList.add('active');
    });
}

function showList() {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('reportView').style.display = 'none';
    document.getElementById('boardView').style.display = 'none';
    document.getElementById('listView').style.display = 'block';
    if (typeof renderIssuesTable === 'function') renderIssuesTable();
    
    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.classList.remove('active');
        if (i === 3) item.classList.add('active');
    });
}

function logout() {
    stopAllMonitors();
    localStorage.clear();
    location.reload();
}