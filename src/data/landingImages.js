export const img = (id) =>
  `https://images.unsplash.com/${id}?auto=format&w=1920&h=1080&fit=crop&q=82`;

export const CARD_ART = [
  "https://cdn.dribbble.com/userupload/16994810/file/original-c6a72b1649c9ba7b49f8b363761c669f.jpg?resize=2048x&vertical=center",
  "https://cdn.dribbble.com/userupload/44517542/file/b5ecdb58cdc591756c64b8d3e21ee106.png?resize=2048x&vertical=center",
  "https://cdn.dribbble.com/userupload/46016309/file/908fb917af8e8bf979e426bafb1c33f4.jpeg?resize=2048x&vertical=center",
  "https://cdn.dribbble.com/userupload/46769177/file/b8cd35ac50ca02b36af6e81845513023.jpg?resize=2048x&vertical=center",
  "https://cdn.dribbble.com/userupload/16734510/file/original-f1e2b34a8a8030e12f2a83625ecac051.png?resize=2048x&vertical=center",
  "https://cdn.dribbble.com/userupload/47331135/file/038efa9d0baab970614b77f9b81f8f36.png?resize=2048x&vertical=center",
  "https://cdn.dribbble.com/userupload/47542355/file/e0df16c98c2bd3daae82e06fe589d91c.jpg?resize=2048x&vertical=center",
];

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 👉 this is what you actually use in UI
export const RANDOM_CARD_ART = shuffle(CARD_ART);

export function fallbackSrc(index) {
  return `https://picsum.photos/seed/proofhire-card-${index}/1920/1080`;
}