/**
 * ATLAS SPINE & WELLNESS — COMMERCIAL FRONTEND ENGINE
 * Version: 2.0 (Production Optimized)
 *
 * Features:
 * - Smart Scroll & Sticky Navigation
 * - High-Performance Parallax
 * - Intersection Observer Animations
 * - Intelligent Chatbot (NLP Lite)
 * - Client-Side Form Validation
 * - Toast Notification System
 */

(function() {
    'use strict';

    // =================================================================
    // 1. CONFIGURATION & STATE
    // =================================================================
    const CONFIG = {
        scrollThreshold: 50,
        typingSpeed: 40,      // ms per character
        botDelay: 600,        // delay before bot starts typing
        autoGreetDelay: 8000, // 8 seconds before bot "pings"
        animationOffset: 0.15 // Trigger animations 15% into view
    };

    const DOM = {
        body: document.body,
        navbar: document.querySelector('.navbar'),
        hamburger: document.querySelector('.hamburger'),
        navMenu: document.querySelector('.nav-menu'),
        reveals: document.querySelectorAll('.reveal'),
        counters: document.querySelectorAll('.number'),
        forms: document.querySelectorAll('form'),
        chat: {
            widget: document.querySelector('.chatbot-widget'),
            toggle: document.getElementById('chatToggle'),
            window: document.getElementById('chatWindow'),
            close: document.getElementById('chatClose'),
            input: document.querySelector('.chat-input-area input'),
            sendBtn: document.querySelector('.chat-input-area button'),
            body: document.querySelector('.chat-body'),
            notification: document.querySelector('.chat-notification')
        }
    };

    let state = {
        lastScrollY: 0,
        isMenuOpen: false,
        isChatOpen: false,
        hasChatted: false
    };


    // =================================================================
    // 2. CORE UTILITIES
    // =================================================================
    
    // Debounce for scroll performance
    const debounce = (func, wait = 10) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    // Easing function for counters (Out Quart)
    const easeOutQuart = (t) => 1 - (--t) * t * t * t;

    // Toast Notification Creator
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerText = message;
        
        // Inject styles dynamically if not present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.innerHTML = `
                .toast-notification {
                    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
                    background: #0a192f; color: #fff; padding: 12px 24px; border-radius: 50px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3); font-family: 'Manrope', sans-serif;
                    font-size: 0.9rem; z-index: 10000; opacity: 0; transition: 0.4s; border: 1px solid #d4af37;
                }
                .toast-notification.active { bottom: 50px; opacity: 1; }
                .toast-error { border-color: #ff4757; }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);
        
        // Animate In
        requestAnimationFrame(() => {
            setTimeout(() => toast.classList.add('active'), 10);
        });

        // Remove
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };


    // =================================================================
    // 3. UI CONTROLLERS
    // =================================================================

    // --- Smart Navbar (Hide on scroll down, show on up) ---
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > CONFIG.scrollThreshold) {
            DOM.navbar.classList.toggle('nav-hidden', currentScrollY > state.lastScrollY);
            DOM.navbar.classList.add('scrolled');
        } else {
            DOM.navbar.classList.remove('nav-hidden', 'scrolled');
        }

        // Parallax Hero Effect
        const hero = document.querySelector('.hero');
        if (hero && currentScrollY < window.innerHeight) {
            hero.style.backgroundPositionY = `${currentScrollY * 0.5}px`;
        }

        state.lastScrollY = currentScrollY;
    };

    // --- Mobile Menu Toggle ---
    const toggleMenu = () => {
        state.isMenuOpen = !state.isMenuOpen;
        
        if (state.isMenuOpen) {
            DOM.navMenu.style.display = 'flex';
            // Apply mobile styles dynamically
            Object.assign(DOM.navMenu.style, {
                flexDirection: 'column', position: 'absolute', top: '90px', left: '0',
                width: '100%', background: '#fff', padding: '30px', 
                borderBottom: '4px solid #d4af37', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                animation: 'slideInRight 0.3s ease'
            });
            DOM.hamburger.classList.add('active');
        } else {
            DOM.navMenu.style.display = 'none';
            DOM.hamburger.classList.remove('active');
        }
    };


    // =================================================================
    // 4. ANIMATION ENGINE
    // =================================================================

    // --- Scroll Reveal System ---
    const initObserver = () => {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    
                    // If it's a counter, start counting
                    if (entry.target.classList.contains('number') || entry.target.querySelector('.number')) {
                        const numEl = entry.target.classList.contains('number') ? entry.target : entry.target.querySelector('.number');
                        if (numEl) animateCounter(numEl);
                    }
                    
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: CONFIG.animationOffset });

        DOM.reveals.forEach(el => observer.observe(el));
        
        // Immediate fade-in for Hero content
        const heroes = document.querySelectorAll('.animate-fade-up');
        heroes.forEach(el => setTimeout(() => el.style.opacity = '1', 100));
    };

    // --- Number Counter ---
    const animateCounter = (el) => {
        if (el.dataset.animated) return; // Prevent double firing
        el.dataset.animated = "true";

        const targetText = el.innerText;
        const target = parseInt(targetText.replace(/\D/g, ''));
        const suffix = targetText.replace(/[0-9]/g, ''); // Get +, %, k
        const duration = 2000;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = easeOutQuart(progress);
            
            const currentVal = Math.floor(ease * target);
            el.innerText = currentVal + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.innerText = targetText; // Ensure exact final value
            }
        };

        requestAnimationFrame(update);
    };


    // =================================================================
    // 5. CHATBOT INTELLIGENCE (NLP LITE)
    // =================================================================

    const Chatbot = {
        
        init() {
            if (!DOM.chat.widget) return;
            
            // Listeners
            DOM.chat.toggle.addEventListener('click', this.toggle.bind(this));
            DOM.chat.close.addEventListener('click', this.close.bind(this));
            
            if (DOM.chat.sendBtn) {
                DOM.chat.sendBtn.addEventListener('click', this.handleUserMessage.bind(this));
                DOM.chat.input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.handleUserMessage();
                });
            }

            // Auto-Greeting
            setTimeout(() => {
                if (!state.hasChatted && !state.isChatOpen) {
                    this.addNotification();
                }
            }, CONFIG.autoGreetDelay);
        },

        toggle() {
            DOM.chat.window.classList.toggle('active');
            state.isChatOpen = DOM.chat.window.classList.contains('active');
            this.removeNotification();
            
            if (state.isChatOpen && !state.hasChatted) {
                // Focus input on open
                setTimeout(() => DOM.chat.input.focus(), 100);
            }
        },

        close() {
            DOM.chat.window.classList.remove('active');
            state.isChatOpen = false;
        },

        addNotification() {
            // Create badge if it doesn't exist
            if (!document.querySelector('.chat-notification')) {
                const badge = document.createElement('span');
                badge.className = 'chat-notification';
                badge.innerText = '1';
                badge.style.cssText = `
                    position: absolute; top: 0; right: 0; background: #e74c3c; color: white;
                    width: 20px; height: 20px; border-radius: 50%; font-size: 0.7rem;
                    display: flex; align-items: center; justify-content: center; border: 2px solid white;
                    animation: pulse 2s infinite;
                `;
                DOM.chat.toggle.appendChild(badge);
            }
        },

        removeNotification() {
            const badge = document.querySelector('.chat-notification');
            if (badge) badge.remove();
        },

        handleUserMessage() {
            const text = DOM.chat.input.value.trim();
            if (!text) return;

            // 1. Show User Message
            this.appendMessage(text, 'user');
            DOM.chat.input.value = '';
            state.hasChatted = true;

            // 2. Show Typing Indicator
            this.showTyping();

            // 3. Generate & Show Response
            setTimeout(() => {
                this.removeTyping();
                const response = this.generateResponse(text);
                this.appendMessage(response, 'bot');
            }, CONFIG.botDelay + (text.length * 10)); // Variable delay based on input length
        },

        showTyping() {
            const typing = document.createElement('div');
            typing.className = 'msg bot typing-indicator';
            typing.innerHTML = '<span>.</span><span>.</span><span>.</span>';
            DOM.chat.body.appendChild(typing);
            this.scrollToBottom();
        },

        removeTyping() {
            const el = document.querySelector('.typing-indicator');
            if (el) el.remove();
        },

        appendMessage(html, sender) {
            const div = document.createElement('div');
            div.className = `msg ${sender}`;
            div.innerHTML = html;
            DOM.chat.body.appendChild(div);
            this.scrollToBottom();
        },

        scrollToBottom() {
            DOM.chat.body.scrollTop = DOM.chat.body.scrollHeight;
        },

        // The "Brain"
        generateResponse(input) {
            const txt = input.toLowerCase();
            
            const knowledgeBase = [
                {
                    keys: ['book', 'appointment', 'schedule', 'consult', 'visit'],
                    resp: "I can absolutely help you book a visit. <br><br><strong><a href='book.html' style='color:#d4af37; text-decoration:underline;'>Click here to check our availability</a></strong>. It only takes a moment."
                },
                {
                    keys: ['insurance', 'cost', 'price', 'billing', 'pay', 'network', 'medicare'],
                    resp: "We accept most major insurance plans (Blue Cross, Aetna, Medicare, United).<br><br>For specific co-pay questions, please call our billing team at <strong>(512) 555-0198</strong>."
                },
                {
                    keys: ['location', 'where', 'address', 'directions', 'park'],
                    resp: "We are located at <strong>123 Wellness Blvd, Austin, TX</strong>.<br><br>There is validated parking in the garage (Level P2)."
                },
                {
                    keys: ['hours', 'open', 'close', 'time', 'weekend'],
                    resp: "Our clinical hours are:<br>Mon-Fri: 9am - 6pm<br>Sat: 10am - 2pm<br>Sun: Closed"
                },
                {
                    keys: ['pain', 'back', 'neck', 'sciatica', 'hurt', 'headache'],
                    resp: "I'm sorry you're in pain. We specialize in non-surgical relief for that.<br><br>I recommend scheduling a <strong>New Patient Exam</strong> so Dr. Carter can evaluate you properly."
                },
                {
                    keys: ['hello', 'hi', 'hey', 'start'],
                    resp: "Hello! Welcome to Atlas Spine. How can I assist you today?"
                }
            ];

            // Find match
            for (let entry of knowledgeBase) {
                if (entry.keys.some(k => txt.includes(k))) {
                    return entry.resp;
                }
            }

            // Default
            return "That's a specific clinical question. I recommend calling our front desk at <strong>(512) 555-0198</strong> for the most accurate answer.";
        }
    };


    // =================================================================
    // 6. FORM HANDLING & VALIDATION
    // =================================================================
    
    const setupForms = () => {
        DOM.forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Simple Validation Logic
                const inputs = form.querySelectorAll('input[required]');
                let isValid = true;
                
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.style.borderColor = '#ff4757';
                        setTimeout(() => input.style.borderColor = '', 2000);
                    }
                    // Basic Email Check
                    if (input.type === 'email' && !input.value.includes('@')) {
                        isValid = false;
                        showToast("Please enter a valid email.", "error");
                    }
                });

                if (isValid) {
                    const btn = form.querySelector('button[type="submit"]');
                    const originalText = btn.innerText;
                    
                    // Loading State
                    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
                    btn.style.opacity = '0.8';
                    
                    // Simulate Server Request
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fa-solid fa-check"></i> Sent!';
                        btn.style.background = '#2ecc71';
                        btn.style.borderColor = '#2ecc71';
                        
                        showToast("Request received! We will contact you shortly.");
                        form.reset();
                        
                        // Reset Button after delay
                        setTimeout(() => {
                            btn.innerText = originalText;
                            btn.style.background = ''; // Reverts to CSS
                            btn.style.borderColor = '';
                            btn.style.opacity = '1';
                        }, 3000);
                    }, 1500);
                } else {
                    if(!document.querySelector('.toast-error')) {
                        showToast("Please fill in all required fields.", "error");
                    }
                }
            });
        });
    };


    // =================================================================
    // 7. INITIALIZATION
    // =================================================================
    
    const init = () => {
        // Event Listeners
        window.addEventListener('scroll', debounce(handleScroll, 10));
        if (DOM.hamburger) DOM.hamburger.addEventListener('click', toggleMenu);

        // Modules
        initObserver();
        Chatbot.init();
        setupForms();

        // Inject Dynamic CSS for Animations that JS controls
        const style = document.createElement('style');
        style.innerHTML = `
            .nav-hidden { transform: translateY(-100%); }
            .typing-indicator span {
                display: inline-block; width: 6px; height: 6px; background: #aaa; 
                border-radius: 50%; margin: 0 2px; animation: bounce 1s infinite;
            }
            .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
            .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        `;
        document.head.appendChild(style);

        console.log("Atlas Spine Engine v2.0 Loaded [Commercial Build]");
    };

    // Boot up
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();