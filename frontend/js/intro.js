/* js/intro.js - Fixed Working Typewriter */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Intro.js loaded');
    
    // Check if intro has been shown before
    const introShown = localStorage.getItem('smartbug_intro_shown');
    
    const introScreen = document.getElementById('introScreen');
    const mainApp = document.getElementById('mainApp');
    const typewriterElement = document.getElementById('typewriterText');
    
    console.log('introScreen:', introScreen);
    console.log('mainApp:', mainApp);
    console.log('typewriterElement:', typewriterElement);
    console.log('introShown:', introShown);
    
    // If intro already shown, hide intro and show app
    if (introShown === 'true') {
        if (introScreen) introScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
        if (typeof updateDashboard === 'function') updateDashboard();
        return;
    }
    
    // First time - make sure mainApp is hidden
    if (mainApp) mainApp.style.display = 'none';
    if (introScreen) introScreen.style.display = 'flex';
    
    // Typewriter animation
    const textToType = "MINI JIRA";
    let index = 0;
    
    // Clear existing text
    if (typewriterElement) {
        typewriterElement.textContent = '';
    }
    
    function typeWriter() {
        if (index < textToType.length) {
            if (typewriterElement) {
                typewriterElement.textContent += textToType.charAt(index);
            }
            index++;
            setTimeout(typeWriter, 150);
        } else {
            // Typing complete - fade out intro
            setTimeout(function() {
                if (introScreen) {
                    introScreen.style.opacity = '0';
                    introScreen.style.transition = 'opacity 0.8s';
                    setTimeout(function() {
                        if (introScreen) introScreen.style.display = 'none';
                        if (mainApp) mainApp.style.display = 'flex';
                        localStorage.setItem('smartbug_intro_shown', 'true');
                        if (typeof updateDashboard === 'function') {
                            updateDashboard();
                        }
                    }, 800);
                }
            }, 800);
        }
    }
    
    // Start typing after a short delay
    setTimeout(typeWriter, 500);
});