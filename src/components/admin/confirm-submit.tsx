"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

/**
 * A submit button that needs a second click, for actions that can't be undone.
 * Must be rendered inside a <form>.
 */
export function ConfirmSubmit({
  label,
  confirmLabel,
  className,
  armedClassName,
}: {
  label: string;
  confirmLabel: string;
  className: string;
  armedClassName: string;
}) {
  const [armed, setArmed] = useState(false);
  const { pending } = useFormStatus();

  if (!armed) {
    return (
      <button type="button" onClick={() => setArmed(true)} className={`${className} cursor-pointer`}>
        {label}
      </button>
    );
  }
  return (
    <button
      type="submit"
      autoFocus
      disabled={pending}
      onBlur={() => setArmed(false)}
      className={`${armedClassName} cursor-pointer disabled:opacity-60`}
    >
      {confirmLabel}
    </button>
  );
}
