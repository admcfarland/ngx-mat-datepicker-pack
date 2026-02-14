/// <reference types="vitest/globals" />

import { provideZonelessChangeDetection } from '@angular/core';

export default [
  provideZonelessChangeDetection(),
  // Add other test providers as needed:
  // provideNoopAnimations(),
  // provideHttpClientTesting(),
];