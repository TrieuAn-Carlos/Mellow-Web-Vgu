anime({
  targets: ".task-card",
  opacity: [0, 1],
  scale: [0.5, 1],
  rotate: (el) => el.getAttribute("data-rotation"),
  delay: anime.stagger(100),
  duration: 1200,
  easing: "easeOutCubic",
  begin: () => {
    document.querySelectorAll(".task-card").forEach((card) => {
      // ... (pháº§n cÃ²n láº¡i cá»§a file khÃ´ng Ä‘á»•i)
    });
  },
});
