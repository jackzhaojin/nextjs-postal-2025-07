import { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "bento-grid",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  children,
}: {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon?: any;
  description: string;
  href?: string;
  cta?: string;
  children?: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "bento-card",
        className,
      )}
    >
      <div className="bento-card-overlay" />
      {background && <div>{background}</div>}
      <div className="bento-card-content">
        {Icon && (
          <Icon className="h-12 w-12 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75" />
        )}
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          {name}
        </h3>
        <p className="max-w-lg text-neutral-400">{description}</p>
        {children}
      </div>

      {href && cta && (
        <div
          className={cn(
            "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
          )}
        >
          <Button variant="ghost" size="sm" className="pointer-events-auto btn-modern btn-modern-sm" asChild>
            <a href={href}>
              {cta}
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      )}
    </div>
  );
};

export { BentoCard, BentoGrid };