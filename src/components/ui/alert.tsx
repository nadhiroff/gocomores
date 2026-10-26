import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("relative flex gap-3 rounded-xl border p-4 text-sm [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground",
      success: "border-[#15803D]/40 bg-[#DCFCE7] text-[#14532D] dark:bg-[#052E16] dark:text-[#BBF7D0]",
      destructive: "border-destructive/50 bg-[#FEE2E2] text-[#7F1D1D] dark:bg-[#450A0A] dark:text-[#FECACA]",
      warning: "border-[#B45309]/40 bg-[#FEF3C7] text-[#78350F] dark:bg-[#422006] dark:text-[#FDE68A]",
    },
  },
  defaultVariants: { variant: "default" },
});

export const Alert = ({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) => (
  <div className={cn(alertVariants({ variant }), className)} {...props} />
);
