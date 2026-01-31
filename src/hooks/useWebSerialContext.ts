import { useContext } from 'react';
import { WebSerialContext, type WebSerialContextType } from '../context/WebSerialContext';

export const useWebSerialContext = (): WebSerialContextType => {
  const context = useContext(WebSerialContext);
  if (!context) {
    throw new Error('useWebSerialContext must be used within a WebSerialProvider');
  }
  return context;
};
