"use strict";

window.ENDFIELD_CONFIG = Object.freeze({
  /*
   * Gunakan URL deployment Google Apps Script milikmu.
   * Bila kamu membuat deployment baru dengan URL berbeda,
   * cukup ganti nilai ini.
   */
  gasUrl:
    "https://script.google.com/macros/s/AKfycby0hVmUegB7eP7kH2srXYUZNV7nQDVzKPyDcbqNH-wCoHLALPhjisLLcISqBbXZwUOWGg/exec",

  /*
   * Browser meminta profil, stamina, dan Activity Tasks terbaru
   * setiap 5 detik ketika tab sedang terlihat.
   * Ini bukan menekan tombol Refresh secara otomatis.
   */
  autoSyncMs: 10000,

  requestTimeoutMs: 90000,

  syncIntervals: Object.freeze({
    visual: 5000,
    balanced: 10000,
    battery: 30000
  }),

  performanceModeDefault: "balanced",

  /* Isi dengan public VAPID key dari GitHub secret VAPID_PUBLIC_KEY. */
  pushVapidPublicKey: "BHIEtGmiEJk9vocX2h0mWYzZr7t34_SQK50j5jWk5RxdMj78FFRrBWp0KuDwSsUtceMer-efK8TuPVEioqFVfBE",

  // PIN default: 123456
  pinSha256:
    "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
});
