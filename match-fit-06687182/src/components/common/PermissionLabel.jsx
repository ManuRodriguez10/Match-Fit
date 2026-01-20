import React from "react";
import { Info } from "lucide-react";

export default function PermissionLabel({ message }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-xl">
      <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
      <p className="text-sm text-amber-800 font-medium">{message}</p>
    </div>
  );
}
