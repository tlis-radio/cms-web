"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface StreamPasswordPromptProps {
  open: boolean;
  error: string | null;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

const StreamPasswordPrompt: React.FC<StreamPasswordPromptProps> = ({ open, error, onSubmit, onCancel }) => {
  const t = useTranslations("player");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) setPassword("");
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm mx-4 p-6 bg-white dark:bg-neutral-900 dark:text-white rounded-lg shadow-2xl"
      >
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {t("password_prompt_title")}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {t("password_prompt_description")}
        </p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("password_placeholder")}
          className="mt-4 w-full px-3 py-2 text-sm border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d43c4a]"
        />
        {error && (
          <p className="mt-2 text-sm text-[#d43c4a]">{t("password_error")}</p>
        )}
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
          >
            {t("password_cancel")}
          </button>
          <button
            type="submit"
            disabled={!password}
            className="px-4 py-2 text-sm bg-[#d43c4a] hover:bg-[#b83744] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            {t("password_submit")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StreamPasswordPrompt;
