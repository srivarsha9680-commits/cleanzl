/* McClean — Frontend JS */

// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Set min date for booking
const dateInput = document.querySelector('input[type="date"]');
if (dateInput) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];
}

// Book form
const bookForm = document.getElementById('bookForm');
const bookSuccess = document.getElementById('bookSuccess');
if (bookForm) {
  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = bookForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Finding cleaners...';

    const data = Object.fromEntries(new FormData(bookForm));

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        bookForm.classList.add('hidden');
        bookSuccess.classList.remove('hidden');
      } else {
        throw new Error('Server error');
      }
    } catch {
      // Fallback: show success anyway in demo mode
      bookForm.classList.add('hidden');
      bookSuccess.classList.remove('hidden');
    }
  });
}

// Apply form
const applyForm = document.getElementById('applyForm');
const applySuccess = document.getElementById('applySuccess');
if (applyForm) {
  applyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = applyForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Submitting application...';

    const data = Object.fromEntries(new FormData(applyForm));

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        applyForm.classList.add('hidden');
        applySuccess.classList.remove('hidden');
      } else {
        throw new Error();
      }
    } catch {
      applyForm.classList.add('hidden');
      applySuccess.classList.remove('hidden');
    }
  });
}
