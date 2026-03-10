import { PieceComponent } from '../PieceComponent';
import type { Piece } from '../../types';
import type { ReserveFilters, ReserveSortKey } from '../../utils/gameSession';

type ReservePanelProps = {
  reservePanelRef: React.RefObject<HTMLElement | null>;
  mobileFocusZone: 'reserve' | 'board' | null;
  availablePiecesCount: number;
  showUsedPieces: boolean;
  setShowUsedPieces: (next: boolean) => void;
  initialPieces: Piece[];
  availablePieceIds: Set<number>;
  setExitingReservePieceIds: React.Dispatch<React.SetStateAction<number[]>>;
  reserveSort: ReserveSortKey;
  reserveSortLabels: Record<ReserveSortKey, string>;
  openReserveMenu: 'sort' | null;
  setOpenReserveMenu: React.Dispatch<React.SetStateAction<'sort' | null>>;
  setReserveSort: (sort: ReserveSortKey) => void;
  reserveFilterMeta: Record<string, { label: string; states: Record<string, string> }>;
  reserveFilters: ReserveFilters;
  cycleReserveFilter: (filterKey: keyof ReserveFilters) => void;
  reservePieces: Piece[];
  handleReserveSelect: (piece: Piece, isAvailable: boolean, isTemporarilyLocked: boolean) => void;
  isAiMode: boolean;
  phase: 'selectPiece' | 'placePiece' | 'gameOver';
  turnPlayer: 1 | 2;
  tutorialTargetPieceId: number | null;
  pickedReservePieceId: number | null;
  pickedReserveActor: 'player' | 'opponent' | null;
  aiReserveHoverId: number | null;
  exitingReservePieceIdSet: Set<number>;
  playerPieceSet: 'classic' | 'modern';
};

export const ReservePanel = ({
  reservePanelRef,
  mobileFocusZone,
  availablePiecesCount,
  showUsedPieces,
  setShowUsedPieces,
  initialPieces,
  availablePieceIds,
  setExitingReservePieceIds,
  reserveSort,
  reserveSortLabels,
  openReserveMenu,
  setOpenReserveMenu,
  setReserveSort,
  reserveFilterMeta,
  reserveFilters,
  cycleReserveFilter,
  reservePieces,
  handleReserveSelect,
  isAiMode,
  phase,
  turnPlayer,
  tutorialTargetPieceId,
  pickedReservePieceId,
  pickedReserveActor,
  aiReserveHoverId,
  exitingReservePieceIdSet,
  playerPieceSet,
}: ReservePanelProps) => (
  <aside
    ref={reservePanelRef}
    className={`game-reserve ${mobileFocusZone === 'board' ? 'is-dimmed' : 'is-emphasized'}`}
  >
    <div className="game-section-head game-section-head-reserve">
      <div className="game-reserve-headline">
        <div className="game-section-title game-section-title-reserve">
          <h3>Резерв</h3>
          <span className="game-section-meta">{availablePiecesCount} фигур</span>
        </div>
        <div className="game-reserve-controls">
          <div className="game-settings-menu">
            <button
              type="button"
              className="game-settings-chip is-interactive"
              onClick={() => setOpenReserveMenu((current) => current === 'sort' ? null : 'sort')}
            >
              {reserveSortLabels[reserveSort]}
            </button>
            {openReserveMenu === 'sort' && (
              <div className="game-settings-dropdown reserve-dropdown">
                {(Object.keys(reserveSortLabels) as ReserveSortKey[]).map((sortKey) => (
                  <button
                    key={sortKey}
                    type="button"
                    className={`game-settings-option ${reserveSort === sortKey ? 'is-active' : ''}`}
                    onClick={() => {
                      setReserveSort(sortKey);
                      setOpenReserveMenu(null);
                    }}
                  >
                    {reserveSortLabels[sortKey]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className={`game-visibility-toggle ${showUsedPieces ? 'is-open' : 'is-closed'}`}
            title="Отображать выбывшие фигуры"
            aria-label="Отображать выбывшие фигуры"
            onClick={() => {
              const nextShowUsedPieces = !showUsedPieces;
              if (nextShowUsedPieces) {
                setExitingReservePieceIds([]);
              } else {
                const hiddenIds = initialPieces
                  .filter((piece) => !availablePieceIds.has(piece.id))
                  .map((piece) => piece.id);
                setExitingReservePieceIds(hiddenIds);
              }
              setShowUsedPieces(nextShowUsedPieces);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2.5 12s3.2-5.5 9.5-5.5S21.5 12 21.5 12s-3.2 5.5-9.5 5.5S2.5 12 2.5 12Z" />
              <circle cx="12" cy="12" r="2.8" />
              {!showUsedPieces && <path d="M4 20L20 4" />}
            </svg>
          </button>
        </div>
      </div>
      <div className="game-reserve-filter-strip" aria-label="Фильтры резерва">
        {(Object.keys(reserveFilterMeta) as Array<keyof ReserveFilters>).map((filterKey) => {
          const meta = reserveFilterMeta[filterKey];
          const currentValue = reserveFilters[filterKey];
          const isActive = currentValue !== 'all';
          const icon = (() => {
            if (filterKey === 'color') {
              return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z" />
                  <path d="M12 3v18" />
                </svg>
              );
            }

            if (filterKey === 'size') {
              return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 15V9" />
                  <path d="M18 19V5" />
                  <path d="M4 9h4" />
                  <path d="M16 5h4" />
                  <path d="M4 15h4" />
                  <path d="M16 19h4" />
                </svg>
              );
            }

            if (filterKey === 'shape') {
              return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="8" cy="12" r="3.25" />
                  <rect x="13" y="8.5" width="6.5" height="6.5" rx="1.2" />
                </svg>
              );
            }

            return (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <ellipse cx="12" cy="12" rx="6.5" ry="4.5" />
                <ellipse cx="12" cy="12" rx="2.4" ry="1.7" />
              </svg>
            );
          })();

          return (
            <button
              key={filterKey}
              type="button"
              className={`game-reserve-filter-toggle ${isActive ? 'is-active' : ''}`}
              title={`${meta.label}: ${meta.states[currentValue]}`}
              onClick={() => cycleReserveFilter(filterKey)}
            >
              <span className="game-reserve-filter-icon">{icon}</span>
              <span className="game-reserve-filter-copy">
                <span className="game-reserve-filter-label">{meta.label}</span>
                <strong>{meta.states[currentValue]}</strong>
              </span>
            </button>
          );
        })}
      </div>
    </div>
    <div className="game-reserve-grid">
      {reservePieces.map((piece) => {
        const isAvailable = availablePieceIds.has(piece.id);
        const isTemporarilyLocked = phase !== 'selectPiece' || (isAiMode && turnPlayer === 2);
        const isLocked = !isAvailable || isTemporarilyLocked;
        const isTutorialTarget = tutorialTargetPieceId === piece.id;

        return (
          <button
            key={piece.id}
            type="button"
            onClick={() => handleReserveSelect(piece, isAvailable, isTemporarilyLocked)}
            className={`game-reserve-item ${isLocked ? 'is-locked' : ''} ${!isAvailable ? 'is-used' : ''} ${isTutorialTarget ? 'is-tutorial-target' : ''} ${pickedReservePieceId === piece.id ? 'is-picked' : ''} ${pickedReservePieceId === piece.id && pickedReserveActor === 'player' ? 'is-picked-player' : ''} ${pickedReservePieceId === piece.id && pickedReserveActor === 'opponent' ? 'is-picked-opponent' : ''} ${aiReserveHoverId === piece.id ? 'is-ai-hover' : ''} ${aiReserveHoverId === piece.id && turnPlayer === 2 ? 'is-ai-hover-opponent' : ''} ${exitingReservePieceIdSet.has(piece.id) && !showUsedPieces ? 'is-hiding' : ''}`}
          >
            <span className="game-piece-id">{piece.id}</span>
            <div className="game-reserve-piece">
              <PieceComponent piece={piece} size="small" variant={playerPieceSet} />
            </div>
          </button>
        );
      })}
    </div>
  </aside>
);
