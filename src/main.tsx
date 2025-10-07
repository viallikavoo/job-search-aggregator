import React from 'react';
import ReactDOM from 'react-dom/client';
import JobSearchApp from './JobSearchApp';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <JobSearchApp />
  </React.StrictMode>,
);
