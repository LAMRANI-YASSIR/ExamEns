import { Component, inject, signal, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DeliberationService } from '../../core/services/deliberation';
import { SessionService } from '../../core/services/session';
import { NoteFormatPipe } from '../../pipes/note-format-pipe';
import { Deliberation, Session } from '../../models/index';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface SessionStat {
  session: Session;
  deliberations: Deliberation[];
  moyenne: number;
  tauxReussite: number;
  nbValide: number;
  nbRattrapage: number;
  nbAjourne: number;
}

@Component({
  selector: 'app-comparaison-sessions',
  imports: [NoteFormatPipe],
  templateUrl: './comparaison-sessions.html',
  styleUrl: './comparaison-sessions.scss'
})
export class ComparaisonSessions implements OnInit {
  @ViewChild('chartBar')   chartBarRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('chartRadar') chartRadarRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartPie')   chartPieRef!:   ElementRef<HTMLCanvasElement>;

  private deliberationSvc = inject(DeliberationService);
  private sessionSvc      = inject(SessionService);

  loading = signal(false);
  error   = signal('');
  stats   = signal<SessionStat[]>([]);

  private charts: Chart[] = [];

  ngOnInit() {
    this.loading.set(true);
    forkJoin({
      sessions:      this.sessionSvc.getAll(),
      deliberations: this.deliberationSvc.getAll(),
    }).subscribe({
      next: ({ sessions, deliberations }) => {
        const stats: SessionStat[] = sessions
          .filter(s => s.statut === 'deliberee' || deliberations.some(d => d.sessionId === s.id))
          .map(session => {
            const delibs = deliberations.filter(d => d.sessionId === session.id);
            const moy = delibs.length > 0
              ? Math.round(delibs.reduce((s, d) => s + d.moyenne, 0) / delibs.length * 100) / 100
              : 0;
            return {
              session,
              deliberations: delibs,
              moyenne: moy,
              tauxReussite: delibs.length > 0
                ? Math.round(delibs.filter(d => d.decision === 'valide').length / delibs.length * 100)
                : 0,
              nbValide:     delibs.filter(d => d.decision === 'valide').length,
              nbRattrapage: delibs.filter(d => d.decision === 'rattrapage').length,
              nbAjourne:    delibs.filter(d => d.decision === 'ajourne').length,
            };
          });

        this.stats.set(stats);
        this.loading.set(false);
        setTimeout(() => this.buildCharts(), 100);
      },
      error: () => { this.error.set('Erreur de chargement'); this.loading.set(false); }
    });
  }

  private sessionLabel(s: Session) {
    return `S${s.id} ${s.type === 'normale' ? 'Normale' : 'Rattrapage'}`;
  }

  private buildCharts() {
    // Destroy previous
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    const stats = this.stats();
    if (!stats.length || !this.chartBarRef) return;

    const labels = stats.map(s => this.sessionLabel(s.session));

    // Chart 1 — Grouped bar: moyenne + taux réussite
    this.charts.push(new Chart(this.chartBarRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Moyenne /20',
            data: stats.map(s => s.moyenne),
            backgroundColor: '#6366f1',
            yAxisID: 'y',
          },
          {
            label: 'Taux réussite %',
            data: stats.map(s => s.tauxReussite),
            backgroundColor: '#10b981',
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: {
          y:  { min: 0, max: 20, position: 'left',  title: { display: true, text: 'Moyenne /20' } },
          y1: { min: 0, max: 100, position: 'right', title: { display: true, text: 'Taux %' },
            grid: { drawOnChartArea: false } }
        }
      }
    }));

    // Chart 2 — Radar
    this.charts.push(new Chart(this.chartRadarRef.nativeElement, {
      type: 'radar',
      data: {
        labels: ['Moyenne', 'Taux réussite', 'Nb étudiants', 'Validés', 'Rattrapages'],
        datasets: stats.map((s, i) => ({
          label: this.sessionLabel(s.session),
          data: [
            s.moyenne / 20 * 100,
            s.tauxReussite,
            Math.min(s.deliberations.length / 30 * 100, 100),
            s.nbValide / Math.max(s.deliberations.length, 1) * 100,
            100 - (s.nbRattrapage / Math.max(s.deliberations.length, 1) * 100),
          ],
          borderColor: ['#6366f1', '#f59e0b', '#10b981'][i % 3],
          backgroundColor: ['rgba(99,102,241,.15)', 'rgba(245,158,11,.15)', 'rgba(16,185,129,.15)'][i % 3],
        }))
      },
      options: {
        responsive: true,
        scales: { r: { min: 0, max: 100 } },
        plugins: { legend: { position: 'bottom' } }
      }
    }));

    // Chart 3 — Stacked bar: décisions
    this.charts.push(new Chart(this.chartPieRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Validé',     data: stats.map(s => s.nbValide),     backgroundColor: '#16a34a', stack: 'a' },
          { label: 'Rattrapage', data: stats.map(s => s.nbRattrapage), backgroundColor: '#d97706', stack: 'a' },
          { label: 'Ajourné',    data: stats.map(s => s.nbAjourne),    backgroundColor: '#dc2626', stack: 'a' },
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
      }
    }));
  }
}