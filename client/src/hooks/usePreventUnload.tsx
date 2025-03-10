import * as React from 'react';

const usePreventUnload = (formDirty: boolean) => {
  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (formDirty) {
        event.preventDefault();
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formDirty]);
};

export default usePreventUnload;