// Preload fonts to avoid FOUT (Flash of Unstyled Text)
(function() {
  // Add Plus Jakarta Sans font preloading
  const jakartaFontLink = document.createElement('link');
  jakartaFontLink.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap';
  jakartaFontLink.rel = 'preload';
  jakartaFontLink.as = 'style';
  document.head.appendChild(jakartaFontLink);
  
  // Add JetBrains Mono font preloading
  const jetbrainsFontLink = document.createElement('link');
  jetbrainsFontLink.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap';
  jetbrainsFontLink.rel = 'preload';
  jetbrainsFontLink.as = 'style';
  document.head.appendChild(jetbrainsFontLink);
  
  // Set the theme based on user preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', prefersDark);
})(); 