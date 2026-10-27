// Presentation helpers for course visuals.
export const THEMES = {
  Programming: { from: '#0f766e', to: '#134e4a', icon: 'code' },
  Web: { from: '#2563eb', to: '#1e3a8a', icon: 'globe' },
  Data: { from: '#7c3aed', to: '#4c1d95', icon: 'database' },
  General: { from: '#b45309', to: '#78350f', icon: 'book' },
}
export const themeFor = (category) => THEMES[category] || THEMES.General
