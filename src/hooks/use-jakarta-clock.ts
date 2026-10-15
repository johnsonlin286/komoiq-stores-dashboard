"use client";

import { useSyncExternalStore } from "react";

const emptyClock = { date: "", time: "" };
let clock = emptyClock;

function formatClock() {
  const now = new Date();
  return {
    date: new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(now),
    time: new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(now),
  };
}

function subscribe(onChange: () => void) {
  const timer = window.setInterval(() => {
    clock = formatClock();
    onChange();
  }, 30_000);

  return () => window.clearInterval(timer);
}

function getSnapshot() {
  if (clock === emptyClock) clock = formatClock();
  return clock;
}

export function useJakartaClock() {
  return useSyncExternalStore(subscribe, getSnapshot, () => emptyClock);
}
