import { Component, inject, signal, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { EtudiantService } from '../../../core/services/etudiant';
import { NoteService } from '../../../core/services/note';
import { ExamenService } from '../../../core/services/examen';
import { ModuleService } from '../../../core/services/module';
import { DeliberationService } from '../../../core/services/deliberation';
import { SessionService } from '../../../core/services/session';
import { NoteFormatPipe } from '../../../pipes/note-format-pipe';
import { MentionPipe } from '../../../pipes/mention-pipe';
import { DecisionLabelPipe } from '../../../pipes/decision-label-pipe';
import { Etudiant, Deliberation, Session } from '../../../models/index';

interface NoteRow {
  moduleNom: string;
  moduleCode: string;
  coefficient: number;
  noteCC: number | null;
  noteExamen: number;
  noteFinale: number;
  valide: boolean;
}

@Component({
  selector: 'app-releve-notes',
  imports: [NoteFormatPipe, MentionPipe, DecisionLabelPipe],
  templateUrl: './releve-notes.html',
  styleUrl: './releve-notes.scss',
})
export class ReleveNotes implements OnInit {
  private etudiantSvc     = inject(EtudiantService);
  private noteSvc         = inject(NoteService);
  private examenSvc       = inject(ExamenService);
  private moduleSvc       = inject(ModuleService);
  private deliberationSvc = inject(DeliberationService);
  private sessionSvc      = inject(SessionService);

  etudiants         = signal<Etudiant[]>([]);
  sessions          = signal<Session[]>([]);
  selectedEtudiant  = signal<Etudiant | null>(null);
  selectedSessionId = signal<number | null>(null);

  noteRows     = signal<NoteRow[]>([]);
  deliberation = signal<Deliberation | null>(null);
  moyenne      = signal(0);

  loading = signal(false);
  error   = signal('');

  annee = '2025-2026';

  ngOnInit() {
    forkJoin({
      etudiants: this.etudiantSvc.getAll(),
      sessions:  this.sessionSvc.getAll(),
    }).subscribe({
      next: ({ etudiants, sessions }) => {
        this.etudiants.set(etudiants);
        this.sessions.set(sessions);
      },
      error: () => this.error.set('Erreur de chargement')
    });
  }

  onEtudiantChange(id: number | string) {
    const etudiant = this.etudiants().find(e => Number(e.id) === Number(id));
    if (!etudiant) return;
    this.selectedEtudiant.set(etudiant);
    this.loadReleve(etudiant.id);
  }

  onSessionChange(id: number | string) {
    this.selectedSessionId.set(Number(id));
    const etudiant = this.selectedEtudiant();
    if (etudiant) this.loadReleve(etudiant.id);
  }

  loadReleve(etudiantId: number) {
    this.loading.set(true);
    this.noteRows.set([]);
    this.deliberation.set(null);

    forkJoin({
      notes:         this.noteSvc.getByEtudiant(etudiantId),
      examens:       this.examenSvc.getAll(),
      modules:       this.moduleSvc.getAll(),
      deliberations: this.deliberationSvc.getByEtudiant(etudiantId),
    }).subscribe({
      next: ({ notes, examens, modules, deliberations }) => {
        const sessionId = this.selectedSessionId();

        // Filter notes by session if selected
        const filteredNotes = sessionId
          ? notes.filter(n => {
              const ex = examens.find(e => e.id === n.examenId);
              return ex?.sessionId === sessionId;
            })
          : notes;

        const rows: NoteRow[] = filteredNotes.map(note => {
          const examen = examens.find(e => e.id === note.examenId);
          const module = modules.find(m => m.id === examen?.moduleId);
          return {
            moduleNom:   module?.nom ?? '—',
            moduleCode:  module?.code ?? '—',
            coefficient: module?.coefficient ?? 1,
            noteCC:      note.noteCC ?? null,
            noteExamen:  note.noteExamen,
            noteFinale:  note.noteFinale,
            valide:      note.noteFinale >= 10,
          };
        });

        this.noteRows.set(rows);

        const total = rows.reduce((s, r) => s + r.noteFinale * r.coefficient, 0);
        const coefs = rows.reduce((s, r) => s + r.coefficient, 0);
        this.moyenne.set(coefs > 0 ? Math.round(total / coefs * 100) / 100 : 0);

        // Find matching deliberation
        let delib = deliberations.find(d => d.sessionId === sessionId);
        if (!delib && deliberations.length > 0) {
          deliberations.sort((a, b) => b.sessionId - a.sessionId);
          delib = deliberations[0];
        }
        this.deliberation.set(delib ?? null);
        this.loading.set(false);
      },
      error: () => { this.error.set('Erreur chargement'); this.loading.set(false); }
    });
  }

  print() { window.print(); }
}