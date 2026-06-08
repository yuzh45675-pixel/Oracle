"use client";

import { useEffect } from "react";
import { warmApiInBackground } from "@/lib/api-fetch";

/** 全站挂载：用户浏览时提前唤醒 Render，减少登录时等待 */
export function ApiWarmup() {
  useEffect(() => {
    warmApiInBackground();
  }, []);

  return null;
}
