// ─── Theme Store: para useSyncExternalStore ───
let themeListeners = [];
let isDarkMode = false;

export const themeStore = {
  subscribe(cb) {
    themeListeners.push(cb);
    return () => {
      themeListeners = themeListeners.filter(l => l !== cb);
    };
  },
  getSnapshot() {
    return isDarkMode;
  },
  toggle() {
    isDarkMode = !isDarkMode;
    themeListeners.forEach(l => l());
  },
};

// ─── Joke API: para use() ───
export const fetchJoke = () =>
  fetch("https://official-joke-api.appspot.com/random_joke").then(r => r.json());
