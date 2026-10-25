import { useEffect } from 'react';

// Mantiene el <title> de la pestaña acorde a la pantalla actual.
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
