import { useEffect } from "react";

import useToastStore from "../../stores/toastStore";

export default function ToastContainer() {
  const items = useToastStore((state) => state.items);
  const remove = useToastStore((state) => state.remove);

  useEffect(() => {
    const timers = items.map((item) => setTimeout(() => remove(item.id), 3000));
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [items, remove]);

  if (items.length === 0) return null;

  return (
    <div className="toast-stack">
      {items.map((item) => (
        <div key={item.id} className={`toast ${item.variant}`}>
          {item.message}
        </div>
      ))}
    </div>
  );
}
