import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toolbar" *ngIf="searchPlaceholder || hasActions">
      <input
        *ngIf="searchPlaceholder"
        type="search"
        class="search-input"
        [placeholder]="searchPlaceholder"
        (input)="searchChange.emit($any($event.target).value)"
        [attr.aria-label]="searchPlaceholder">
      <ng-content select="[tableActions]"></ng-content>
    </div>

    <div *ngIf="loading" class="empty-state">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>{{ loadingText }}</p>
    </div>

    <div *ngIf="!loading && empty" class="empty-state">
      <i class="fa-solid" [ngClass]="emptyIcon"></i>
      <p>{{ emptyText }}</p>
      <ng-content select="[emptyAction]"></ng-content>
    </div>

    <div *ngIf="!loading && !empty" class="table-wrapper">
      <table class="data-table">
        <ng-content></ng-content>
      </table>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }

    .search-input {
      flex: 1;
      max-width: 340px;
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: 14px;
      background: var(--white);
      color: var(--text-dark);
      font-size: 13.5px;
      font-family: inherit;
      transition: border-color 0.15s;

      &:focus { outline: none; border-color: var(--primary); }
      &::placeholder { color: var(--text-muted); }
    }

    .table-wrapper {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border-radius: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 36px 16px;
      color: var(--text-muted);

      i {
        font-size: 2rem;
        color: var(--primary);
        margin-bottom: 8px;
        display: block;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }

    /* ── MOBILE ── */
    @media (max-width: 767px) {
      .toolbar {
        gap: 8px;
        margin-bottom: 14px;

        .search-input {
          max-width: 100%;
          flex-basis: 100%;
          min-height: 44px;
          font-size: 14px;
        }
      }

      .empty-state {
        padding: 28px 12px;

        i { font-size: 1.6rem; }
        p { font-size: 13px; }
      }
    }

    /* ── TABLET ── */
    @media (min-width: 768px) and (max-width: 1023px) {
      .search-input {
        max-width: 280px;
      }
    }
  `]
})
export class DataTableComponent {
  @Input() loading = false;
  @Input() empty = false;
  @Input() searchPlaceholder = '';
  @Input() loadingText = 'Cargando...';
  @Input() emptyText = 'No se encontraron resultados';
  @Input() emptyIcon = 'fa-inbox';
  @Input() hasActions = false;
  @Output() searchChange = new EventEmitter<string>();
}
