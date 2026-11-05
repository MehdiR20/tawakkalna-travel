"use client";

import { useActionState } from "react";
import { deleteDestinationAction } from "@/actions/admin";
import { useI18n } from "@/i18n/provider";
import type { ActionState } from "@/lib/validation";
import { ConfirmSubmit } from "./confirm-submit";

const initial: ActionState = {};

export function DeleteDestination({ id, title }: { id: string; title: string }) {
  const { t } = useI18n();
  const [state, action] = useActionState(deleteDestinationAction, initial);
  return (
    <form action={action} aria-label={t.admin.deleteLabel(title)} className="inline-block">
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmit
        label={t.admin.delete}
        confirmLabel={t.admin.confirmDelete}
        className="min-h-9 rounded-lg px-2.5 text-sm font-medium whitespace-nowrap text-clay-700 hover:bg-clay-100"
        armedClassName="min-h-9 rounded-lg bg-clay-600 px-2.5 text-sm font-semibold whitespace-nowrap text-white"
      />
      {state.error && (
        <p role="alert" className="mt-1 max-w-56 text-start text-xs text-clay-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
