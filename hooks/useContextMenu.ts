import { useState, useEffect } from 'react';

export function useContextMenu<T>() {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: T } | null>(null);

  const openContextMenu = (e: React.MouseEvent, item: T) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    const handleScroll = () => closeContextMenu();
    
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      document.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [contextMenu]);

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
  };
}
