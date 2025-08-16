"use client";

export function getAuthToken() {
  if (window && window.localStorage) {
    return window.localStorage.getItem("authToken");
  }
  return null;
}
