// CSS is more based than anyone will accept
// But we live in a JS world
export let primaryColor = "orange";
// You MUST call this from main.tsx!
export const setPrimaryColor = () => {
  const setTheColor = () => {
    primaryColor = getComputedStyle(document.body).getPropertyValue('--primary').trim();
  };
  if (document.readyState !== 'loading') {
    setTheColor();
  } else {
    document.addEventListener('DOMContentLoaded', setTheColor);
  }
};

