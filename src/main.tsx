import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App.tsx'
import { setPrimaryColor } from './util.ts';

setPrimaryColor();

const init = () =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

if (localStorage.getItem('first-use') !== null)
  init();

document.getElementById("open")?.addEventListener("click", () => {
  localStorage.setItem('first-use', ""+new Date().getTime());
  localStorage.setItem('token', crypto.randomUUID());
  init();
});
