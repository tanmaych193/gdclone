import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GoogleDriveClone from './GoogleDriveClone.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleDriveClone />
  </StrictMode>,
)
