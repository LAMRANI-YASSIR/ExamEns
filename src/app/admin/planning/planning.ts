import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ExamenService } from '../../core/services/examen';
import { ModuleService } from '../../core/services/module';
import { SessionService } from '../../core/services/session';
import { Examen, Module, Session } from '../../models';

interface CalendarDay {
  date: string;
  label: string;
  examens: ExamenCard[];
}

interface ExamenCard {
  examen: Examen;
  moduleName: string;
  moduleCode: string;
  color: string;
}

const COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f59e0b',
  '#10b981','#3b82f6','#ef4444','#14b8a6','#f97316','#84cc16',
];

@Component({
  selector: 'app-planning',
  templateUrl: './planning.html',
  styleUrl: './planning.scss'
})
export class Planning implements OnInit {
  private examenSvc  = inject(ExamenService);
  private moduleSvc  = inject(ModuleService);
  private sessionSvc = inject(SessionService);

  sessions          = signal<Session[]>([]);
  selectedSessionId = signal<number | null>(null);
  examens           = signal<Examen[]>([]);
  modules           = signal<Module[]>([]);
  loading           = signal(false);
  error             = signal('');
  weeks             = signal<CalendarDay[][]>([]);

  readonly dayLabels = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  private colorMap = new Map<number, string>();

  legendItems = computed(() =>
    this.modules()
      .filter(m => this.examens().some(e => e.moduleId === m.id))
      .map(m => ({ code: m.code, nom: m.nom, color: this.colorMap.get(m.id) ?? '#6366f1' }))
  );

  ngOnInit() {
    forkJoin({
      sessions: this.sessionSvc.getAll(),
      modules:  this.moduleSvc.getAll(),
    }).subscribe({
      next: ({ sessions, modules }) => {
        this.sessions.set(sessions);
        this.modules.set(modules);
        modules.forEach((m, i) => this.colorMap.set(m.id, COLORS[i % COLORS.length]));
        if (sessions.length > 0) this.selectSession(sessions[0].id);
      },
      error: () => this.error.set('Erreur de chargement')
    });
  }

  selectSession(id: number) {
    this.selectedSessionId.set(id);
    this.loading.set(true);
    this.examenSvc.getBySession(id).subscribe({
      next: (examens) => {
        this.examens.set(examens);
        this.buildCalendar(examens);
        this.loading.set(false);
      },
      error: () => { this.error.set('Erreur'); this.loading.set(false); }
    });
  }

  private buildCalendar(examens: Examen[]) {
    if (!examens.length) { this.weeks.set([]); return; }

    const dates = [...examens.map(e => e.date)].sort();
    const start = new Date(dates[0]);
    const end   = new Date(dates[dates.length - 1]);

    const startMonday = new Date(start);
    startMonday.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    const endSunday = new Date(end);
    const remaining = (7 - ((end.getDay() + 6) % 7)) % 7;
    endSunday.setDate(end.getDate() + remaining);

    const dayNames = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
    const days: CalendarDay[] = [];
    const cursor = new Date(startMonday);

    while (cursor <= endSunday) {
      const dateStr = cursor.toISOString().split('T')[0];
      const dayExamens = examens
        .filter(e => e.date === dateStr)
        .map(e => {
          const mod = this.modules().find(m => m.id === e.moduleId);
          return {
            examen: e,
            moduleName: mod?.nom ?? '—',
            moduleCode: mod?.code ?? '—',
            color: this.colorMap.get(e.moduleId) ?? '#6366f1',
          };
        });

      days.push({
        date: dateStr,
        label: `${dayNames[cursor.getDay()]} ${cursor.getDate()}`,
        examens: dayExamens,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const weeksArr: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) weeksArr.push(days.slice(i, i + 7));
    this.weeks.set(weeksArr);
  }

  isToday(d: string) { return d === new Date().toISOString().split('T')[0]; }
  isWeekend(d: string) { const w = new Date(d).getDay(); return w === 0 || w === 6; }

  moduleName(id: number) { return this.modules().find(m => m.id === id)?.nom ?? '—'; }
  moduleCode(id: number) { return this.modules().find(m => m.id === id)?.code ?? '—'; }
}