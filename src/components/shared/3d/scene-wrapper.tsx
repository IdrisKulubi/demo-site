"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const Scene3D = dynamic(() => import("./love-scene"), {
  ssr: false,
  loading: () => null,
});

const TeddyScene = dynamic(() => import("./teddy-scene"), {
  ssr: false,
  loading: () => null,
});

export function Scene3DWrapper() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none">
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <TeddyScene />
      </Suspense>
    </>
  );
}
