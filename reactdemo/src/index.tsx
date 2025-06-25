import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { CssBaseline, ThemeProvider, createTheme } from '@material-ui/core';

const darkTheme = createTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#bb86fc'
    },
    secondary: {
      main: '#03dac6'
    },
    background: {
      default: '#121212',
      paper: '#303030'
    }
  }
});

ReactDOM.render(
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
  document.getElementById('root')
);
