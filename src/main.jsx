import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MarathonDashboard from '../MarathonDashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MarathonDashboard />
  </StrictMode>,
)
