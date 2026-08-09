@import "tailwindcss";

@layer utilities {
  /* Mobile safe area padding for devices with notches / home indicators */
  .pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
  }
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  .pl-safe {
    padding-left: env(safe-area-inset-left, 0px);
  }
  .pr-safe {
    padding-right: env(safe-area-inset-right, 0px);
  }
}

html, body {
  min-height: 100%;
  min-height: 100dvh;
  width: 100%;
  overflow-x: hidden;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior-y: none;
}
