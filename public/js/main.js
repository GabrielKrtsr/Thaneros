const reveals = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".counter");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

reveals.forEach((item) => revealObserver.observe(item));

const animateCounter = (element) => {
  const target = Number(element.dataset.target || 0);
  const duration = 1300;
  const startTime = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.floor(target * easeOut);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = String(target);
    }
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const carousels = document.querySelectorAll("[data-carousel]");

carousels.forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));

  if (!track || slides.length === 0) {
    return;
  }

  let currentIndex = 0;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let autoplayId = null;

  const updateCarousel = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  };

  const goToSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    updateCarousel();
  };

  const stopAutoplay = () => {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayId = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 3200);
  };

  track.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
    currentX = event.clientX;
    track.setPointerCapture(event.pointerId);
    stopAutoplay();
  });

  track.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    currentX = event.clientX;
  });

  const endDrag = () => {
    if (!isDragging) {
      return;
    }

    const deltaX = currentX - startX;
    isDragging = false;

    if (Math.abs(deltaX) > 50) {
      goToSlide(currentIndex + (deltaX < 0 ? 1 : -1));
    } else {
      updateCarousel();
    }

    startAutoplay();
  };

  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  track.addEventListener("pointerleave", endDrag);

  updateCarousel();
  startAutoplay();

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
});
