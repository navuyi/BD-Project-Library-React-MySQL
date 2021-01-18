import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import './styles.css';

// Erase access token from localstorage after page is closed or refreshed 
window.onunload = () =>{
  localStorage.clear();
} 

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

