import * as React from "react";

import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-sm text-gray-200", className)} {...props} />
    </div>
  );
}

export function Thead({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("bg-white/5", className)} {...props} />;
}

export function Tbody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y divide-white/10", className)} {...props} />;
}

export function Tr({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr className={cn("hover:bg-white/5", className)} {...props} />;
}

export function Th({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left font-medium text-gray-300 border-b border-white/10",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 text-gray-100 align-middle", className)} {...props} />;
}
