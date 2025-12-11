// CROZZ ECOSYSTEM Demo Interactive Features
// Mobile-responsive navigation and interactive elements

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const isExpanded = navMenu.classList.contains('active');
      navToggle.setAttribute('aria-expanded', isExpanded);
    });
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  // Interactive Demo Tabs
  const demoTabs = document.querySelectorAll('.demo-tab');
  const demoContents = document.querySelectorAll('.demo-content');
  
  demoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      
      // Remove active class from all tabs and contents
      demoTabs.forEach(t => t.classList.remove('active'));
      demoContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
      
      // Update aria-selected
      demoTabs.forEach(t => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
    });
  });
  
  // Smooth Scroll for Anchor Links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = 80; // Account for fixed navbar
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  // Intersection Observer for Scroll Animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe feature cards and resource cards
  const animatedElements = document.querySelectorAll('.feature-card, .resource-card');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
  
  // Copy Code to Clipboard
  const codeBlocks = document.querySelectorAll('.code-block');
  codeBlocks.forEach(block => {
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy';
    copyButton.className = 'btn btn-secondary';
    copyButton.style.cssText = 'position: absolute; top: 10px; right: 10px; padding: 0.5rem 1rem; font-size: 0.875rem;';
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    block.parentNode.insertBefore(wrapper, block);
    wrapper.appendChild(block);
    wrapper.appendChild(copyButton);
    
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(block.textContent);
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      } catch (err) {
        copyButton.textContent = 'Failed';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      }
    });
  });
  
  // Navbar Scroll Effect
  let lastScroll = 0;
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
      navbar.style.boxShadow = 'none';
    } else {
      navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    }
    
    // Hide/show navbar on scroll
    if (currentScroll > lastScroll && currentScroll > 100) {
      navbar.style.transform = 'translateY(-100%)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
  });
  
  // Stats Counter Animation
  const stats = document.querySelectorAll('.stat-number');
  stats.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
      current += increment;
      if (current < target) {
        stat.textContent = Math.ceil(current).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        stat.textContent = target.toLocaleString();
      }
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateCounter();
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    counterObserver.observe(stat);
  });
  
  // Interactive Demo Simulation
  const demoPlayButton = document.getElementById('demo-play');
  if (demoPlayButton) {
    demoPlayButton.addEventListener('click', () => {
      const demoVideo = document.querySelector('.demo-video');
      demoVideo.innerHTML = '<p style="color: #94a3b8; font-size: 1.125rem;">🎬 Demo video would play here</p>';
      demoPlayButton.disabled = true;
      demoPlayButton.textContent = 'Playing...';
      
      setTimeout(() => {
        demoPlayButton.disabled = false;
        demoPlayButton.textContent = '▶️ Try Live Demo';
      }, 3000);
    });
  }
  
  // Form Validation (if feedback form exists)
  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(feedbackForm);
      const data = Object.fromEntries(formData);
      
      console.log('Feedback submitted:', data);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'alert alert-success';
      successMessage.textContent = '✅ Thank you for your feedback!';
      successMessage.style.cssText = 'padding: 1rem; background: #10b981; color: white; border-radius: 0.5rem; margin-top: 1rem;';
      
      feedbackForm.appendChild(successMessage);
      feedbackForm.reset();
      
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    });
  }
  
  // Lazy Loading for Images
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
  
  // Dark/Light Theme Toggle (if implemented)
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    themeToggle.addEventListener('click', () => {
      const theme = document.documentElement.getAttribute('data-theme');
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
  
  // Keyboard Navigation Enhancement
  document.addEventListener('keydown', (e) => {
    // ESC key closes mobile menu
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    
    // Tab navigation for demo tabs
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const focusedTab = document.activeElement;
      if (focusedTab.classList.contains('demo-tab')) {
        e.preventDefault();
        const tabs = Array.from(demoTabs);
        const currentIndex = tabs.indexOf(focusedTab);
        let nextIndex;
        
        if (e.key === 'ArrowLeft') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else {
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }
        
        tabs[nextIndex].click();
        tabs[nextIndex].focus();
      }
    }
  });
  
  console.log('🚀 CROZZ ECOSYSTEM Demo loaded successfully!');
});

// Performance Monitoring
if ('PerformanceObserver' in window) {
  try {
    const perfObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.renderTime || entry.loadTime);
        }
      }
    });
    perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // Silently fail if not supported
  }
}
