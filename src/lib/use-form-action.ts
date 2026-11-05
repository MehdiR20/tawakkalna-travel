"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import type { ActionState } from "./validation";

/**
 * useActionState wired through onSubmit rather than <form action>. React resets
 * a form after a form action completes, which would wipe what the user typed
 * whenever validation fails.
 */
export function useFormAction(action: (prev: ActionState, data: FormData) => Promise<ActionState>, initial: ActionState) {
  const [state, dispatch, pending] = useActionState(action, initial);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => dispatch(data));
  };
  return { state, onSubmit, pending };
}
