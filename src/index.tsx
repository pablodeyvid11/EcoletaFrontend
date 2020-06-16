import React from 'react'; // importando biblioteca
import ReactDOM from 'react-dom'; // DOM= Web
import App from './App';


ReactDOM.render(
  <React.StrictMode>
    <App /> 
  </React.StrictMode>,
  document.getElementById('root') 
); // Esse método faz o seguinte: Manda o ReactDOM renderizar o APP no elemento ID
