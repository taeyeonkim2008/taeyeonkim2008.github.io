// Fade-in animation on scroll
document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll(
    '.section-title, .about-content, .project-card, .contact-text, .contact-links'
  );

  targets.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach(el => observer.observe(el));

  // Navbar background on scroll
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar.style.borderBottomColor =
      window.scrollY > 50 ? 'var(--color-border)' : 'transparent';
  });
});
