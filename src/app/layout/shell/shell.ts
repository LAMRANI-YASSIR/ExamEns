// src/app/layout/shell/shell.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Sidebar],
  template: `
    <div class="app-layout">
      <app-sidebar />
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
      padding: 1.5rem;
      background: var(--bg);        /* ✅ FIX: CSS variable → dark mode fonctionne */
      color: var(--text);
      overflow-y: auto;
      transition: background .3s ease, color .3s ease;
    }
  `]
})
export class Shell {}