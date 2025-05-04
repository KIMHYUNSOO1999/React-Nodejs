import { useEffect } from "react";

function Alert({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000); 

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`p-4 rounded-lg shadow-lg max-w-md w-full ${
        type === "error" ? "bg-red-100 border border-red-400 text-red-700" :
        type === "success" ? "bg-green-100 border border-green-400 text-green-700" :
        "bg-blue-100 border border-blue-400 text-blue-700"
      }`}>
        <div className="flex items-center">
          <span className="mr-2">
            {type === "error" ? "⚠️" : type === "success" ? "✅" : "ℹ️"}
          </span>
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}

export default Alert; 