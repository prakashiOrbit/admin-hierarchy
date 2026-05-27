import React, { createContext, useContext } from 'react';
import { LightTheme } from './tokens';

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const theme = LightTheme;

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
