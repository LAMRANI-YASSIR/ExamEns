import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { SessionList } from './sessions/session-list/session-list';
import { SessionForm } from './sessions/session-form/session-form';
import { ExamenList } from './examens/examen-list/examen-list';
import { ExamenForm } from './examens/examen-form/examen-form';
import { DeliberationList } from './deliberations/deliberation-list/deliberation-list';
import { ReleveNotes } from './releve/releve-notes/releve-notes';

export const adminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',          component: Dashboard },
  { path: 'sessions',           component: SessionList },
  { path: 'sessions/new',       component: SessionForm },
  { path: 'sessions/edit/:id',  component: SessionForm },
  { path: 'examens',            component: ExamenList },
  { path: 'examens/new',        component: ExamenForm },
  { path: 'examens/edit/:id',   component: ExamenForm },
  { path: 'deliberations',      component: DeliberationList },
  { path: 'releve',             component: ReleveNotes },
];