"use client";

import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { refs } from "@/lib/convexRefs";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";

export default function SettingsPage() {
  const me = useQuery(refs.usersMe);
  const update = useMutation(refs.updateSettings);
  const { signOut } = useAuthActions();
  if (!me) return <p>Loading settings…</p>;
  return (
    <div className="mx-auto max-w-[560px]">
      <h1 className="font-display text-[40px]">Settings</h1>
      <form
        className="mt-32 flex flex-col gap-16"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void update({
            displayName: String(form.get("displayName")),
            retention: form.get("retention") as "24h" | "7d" | "30d",
          });
        }}
      >
        <Field label="Display name">
          <Input name="displayName" defaultValue={me.name ?? ""} />
        </Field>
        <Field label="Email">
          <Input value={me.email ?? ""} disabled />
        </Field>
        <Field label="File retention" hint="Expired objects are deleted from storage. Job metadata remains.">
          <Select name="retention" defaultValue={me.retention}>
            <option value="24h">24 hours</option>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
          </Select>
        </Field>
        <Button type="submit">Save</Button>
      </form>
      <Button className="mt-32" variant="secondary" onClick={() => void signOut()}>
        Log out
      </Button>
    </div>
  );
}
