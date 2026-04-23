/* js/demo.js - Simulated Collaboration Demo */

function runDemoScenario() {
    addMessage("🎬 STARTING DEMO SCENARIO", "info");
    
    setTimeout(() => {
        addMessage("📝 Tester reports critical bug: 'Login button not working'", "info");
    }, 1000);
    
    setTimeout(() => {
        addMessage("🔔 Notification sent to Developer 'Sarah'", "success");
        addMessage("👩‍💻 Sarah: 'I'll look into BUG-106'", "info");
    }, 3000);
    
    setTimeout(() => {
        addMessage("⚙️ Sarah changed BUG-106 status to IN PROGRESS", "info");
        developerUpdatesStatus('BUG-106', 'in-progress', 'Sarah');
    }, 5000);
    
    setTimeout(() => {
        addMessage("💬 Sarah: 'Found the issue - CSS conflict'", "info");
    }, 7000);
    
    setTimeout(() => {
        addMessage("✅ Sarah resolved BUG-106", "success");
        bugResolved('BUG-106', 'Login button not working', 'Sarah');
    }, 9000);
    
    setTimeout(() => {
        addMessage("🔔 Tester notified: 'Please verify the fix'", "info");
        addMessage("🎉 DEMO COMPLETE! This shows how team collaboration works", "success");
    }, 11000);
}

// Add a button to run demo
function addDemoButton() {
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
        const demoBtn = document.createElement('button');
        demoBtn.className = 'btn btn-secondary';
        demoBtn.innerHTML = '🎬 Run Demo Scenario';
        demoBtn.onclick = runDemoScenario;
        headerRight.appendChild(demoBtn);
    }
}

// Call this after dashboard loads
if (typeof updateDashboard === 'function') {
    const originalUpdate = updateDashboard;
    updateDashboard = function() {
        originalUpdate();
        addDemoButton();
    };
}