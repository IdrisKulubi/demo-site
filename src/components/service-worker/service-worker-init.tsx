"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/utils/image-cache-sw";

export function ServiceWorkerInit() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
