import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WindProvider } from "./wind/WindContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <WindProvider>

        <App />

    </WindProvider>

  </StrictMode>,
)
