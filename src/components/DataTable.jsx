import React, { useMemo, useState, useEffect } from 'react';
import Card from '../layout/containers/Card';
import Row from '../layout/containers/Row';
import Column from '../layout/containers/Column';
import Text from './Text';
import { TextInput, SearchInput } from './Input';
import SelectDropdown from './SelectDropdown';
import Button from './Button';
import ToggleSwitch from './ToggleSwitch';
import Spacer from './Spacer';

/**
 * DataTable - Reusable, client-side table with optional search, sort, filters and pagination
 *
 * UI structure map:
 * - Header Row (optional): small caption + toggle switch to reveal controls
 * - Controls Card (optional): search + filters (hidden entirely if both disabled)
 * - Table Card: actual data grid (header row + body rows)
 * - Pagination Row (optional): only when enabled and needed
 */
const DataTable = ({
  columns = [],
  data = [],
  enableSearch = true,
  enableSort = true,
  enableFilters = true,
  enablePagination = false,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50],
  controlsInitiallyOpen = true,
  onRowClick,
  showHeader = true,
  showControlsToggle = true,
  compact = false,
  stickyHeader = false,
}) => {
  // --- state for controls (search/filters), sorting and paging ---
  const [controlsOpen, setControlsOpen] = useState(controlsInitiallyOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset to first page whenever search/filters/sort/pageSize change
  useEffect(() => { setPage(1); }, [searchQuery, JSON.stringify(activeFilters), sortKey, sortDir, pageSize]);

  // Helper to safely resolve nested keys (e.g. "user.name")
  const getCellValue = (row, key) => {
    const value = key?.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), row);
    return value === null || value === undefined ? '' : value;
  };

  const searchableColumns = useMemo(() => columns.filter(c => c.searchable !== false), [columns]);

  // --- derive filtered/sorted rows ---
  const filtered = useMemo(() => {
    let rows = Array.isArray(data) ? data.slice() : [];
    // Search across searchable columns
    if (enableSearch && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      rows = rows.filter(row => searchableColumns.some(col => String(getCellValue(row, col.key)).toLowerCase().includes(q)));
    }
    // Column filters
    if (enableFilters && activeFilters && Object.keys(activeFilters).length) {
      rows = rows.filter(row => Object.entries(activeFilters).every(([key, filter]) => {
        if (filter === undefined || filter === null || filter === '') return true;
        const value = String(getCellValue(row, key) ?? '').toLowerCase();
        if (typeof filter === 'string') return value.includes(filter.toLowerCase());
        if (Array.isArray(filter)) return filter.length === 0 ? true : filter.map(String).map(v => v.toLowerCase()).includes(value);
        if (typeof filter === 'object' && filter?.op && filter?.value !== undefined) {
          const fv = String(filter.value).toLowerCase();
          if (filter.op === 'eq') return value === fv;
          if (filter.op === 'neq') return value !== fv;
          if (filter.op === 'includes') return value.includes(fv);
        }
        return true;
      }));
    }
    // Sort (if enabled)
    if (enableSort && sortKey) {
      rows.sort((a, b) => {
        const av = getCellValue(a, sortKey);
        const bv = getCellValue(b, sortKey);
        const aStr = typeof av === 'number' ? av : String(av).toLowerCase();
        const bStr = typeof bv === 'number' ? bv : String(bv).toLowerCase();
        if (aStr < bStr) return sortDir === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [data, enableSearch, searchableColumns, searchQuery, enableFilters, activeFilters, enableSort, sortKey, sortDir]);

  // --- pagination derivations ---
  const paged = useMemo(() => {
    if (!enablePagination) return filtered;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, enablePagination, page, pageSize]);

  const totalPages = useMemo(() => !enablePagination ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize)), [filtered.length, enablePagination, pageSize]);

  // --- header sorting interaction ---
  const onHeaderClick = (col) => {
    if (!enableSort || col.sortable === false) return;
    const key = col.key;
    if (sortKey === key) setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const cellPadding = compact ? '8px 12px' : '12px 16px';

  // --- header cell renderer ---
  const renderHeaderCell = (col) => {
    const isSorted = sortKey === col.key;
    return (
      <th
        key={col.key}
        style={{ padding: cellPadding, textAlign: col.align || 'left', fontWeight: 600, cursor: enableSort && col.sortable !== false ? 'pointer' : 'default', position: stickyHeader ? 'sticky' : undefined, top: stickyHeader ? 0 : undefined, background: stickyHeader ? 'var(--color-gray-ultralight)' : undefined, zIndex: stickyHeader ? 1 : undefined }}
        onClick={() => onHeaderClick(col)}
        title={enableSort && col.sortable !== false ? 'Click to sort' : undefined}
      >
        {/* Header label + sort caret */}
        <Row padding="0px" fitContent margin="0px" gap="0px" alignItems="center">
          <Text variant="body" bold>{col.header}</Text>
          {isSorted && (<Text variant="caption1" color="gray-dark">{sortDir === 'asc' ? '▲' : '▼'}</Text>)}
        </Row>
      </th>
    );
  };

  // --- body cell renderer ---
  const renderCell = (row, col) => {
    const content = col.render ? col.render(row) : getCellValue(row, col.key);
    return (
      <td key={col.key} style={{ padding: cellPadding, textAlign: col.align || 'left', verticalAlign: 'top' }}>
        {typeof content === 'string' || typeof content === 'number' ? <Text variant="body">{String(content)}</Text> : content}
      </td>
    );
  };

  // --- controls renderer (search + filters) ---
  const renderControls = () => {
    // Hide the entire controls card if closed OR both features disabled
    if (!controlsOpen || (!enableSearch && !enableFilters)) return null;
    return (
      <Card padding="12px" backgroundColor="var(--color-white)" borderColor="var(--color-gray-light)">
        <Column gap="10px">
          {enableSearch && (
            <Row gap="8px" alignItems="center" wrap>
              <Text variant="body" color="gray-dark">Search</Text>
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search..." />
              {searchQuery && (<Button variant="secondary" onClick={() => setSearchQuery('')}>Clear</Button>)}
            </Row>
          )}

          {enableFilters && (
            <Column gap="8px">
              <Text variant="body" color="gray-dark">Filters</Text>
              <Row gap="10px" wrap>
                {columns.filter(c => c.filterKey || c.key).map(col => {
                  const key = col.filterKey || col.key;
                  if (col.filterOptions && Array.isArray(col.filterOptions)) {
                    const options = col.filterOptions.map(opt => ({ value: opt.value ?? opt, label: opt.label ?? String(opt) }));
                    return (
                      <SelectDropdown
                        key={key}
                        label={col.header}
                        value={activeFilters[key] ?? ''}
                        onChange={(val) => setActiveFilters(prev => ({ ...prev, [key]: val }))}
                        options={[{ value: '', label: 'All' }, ...options]}
                      />
                    );
                  }
                  return (
                    <TextInput
                      key={key}
                      label={col.header}
                      value={activeFilters[key] ?? ''}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={`Filter ${col.header}`}
                    />
                  );
                })}
                {Object.keys(activeFilters).length > 0 && (
                  <Button variant="secondary" onClick={() => setActiveFilters({})}>Reset Filters</Button>
                )}
              </Row>
            </Column>
          )}
        </Column>
      </Card>
    );
  };

  const shouldShowPagination = enablePagination && filtered.length > pageSize;

  return (
    // Wrapper column for the whole table UI
    <Column gap="6px" style={{ minWidth: 0 }}>
      {/* Header row with title + controls toggle (optional) */}
      {showHeader && (
        <Row justifyContent="space-between" alignItems="center" wrap>
          <Text variant="h6">Table</Text>
          {showControlsToggle && (
            <Row gap="12px" alignItems="center">
              <Text variant="caption" color="gray-dark">Controls</Text>
              <ToggleSwitch checked={controlsOpen} onChange={() => setControlsOpen(v => !v)} />
            </Row>
          )}
        </Row>
      )}

      {/* Controls card (search + filters). Hidden if both features disabled. */}
      {renderControls()}

      {/* Main table card */}
      <Card padding="0" backgroundColor="var(--color-white)" shadow borderRadius="12px">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            {/* Column headers */}
            <thead>
              <tr style={{ backgroundColor: 'var(--color-gray-ultralight)', borderBottom: '1px solid var(--color-gray-light)' }}>
                {columns.map(renderHeaderCell)}
              </tr>
            </thead>
            {/* Data rows */}
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ padding: '16px' }}>
                    <Text variant="body" color="gray-dark">No data</Text>
                  </td>
                </tr>
              ) : (
                paged.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-gray-light)', cursor: onRowClick ? 'pointer' : 'default' }} onClick={() => onRowClick && onRowClick(row)}>
                    {columns.map(col => renderCell(row, col))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination bar (only when enabled and needed) */}
      {shouldShowPagination && (
        <Row justifyContent="space-between" alignItems="center" wrap>
          <Row gap="8px" alignItems="center" wrap>
            <Button variant="secondary" onClick={() => setPage(1)} disabled={page === 1}>First</Button>
            <Button variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            <Text variant="caption" color="gray-dark">Page {page} of {totalPages}</Text>
            <Button variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            <Button variant="secondary" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</Button>
          </Row>
          <Row gap="8px" alignItems="center" wrap>
            <Text variant="caption" color="gray-dark">Rows per page</Text>
            <SelectDropdown value={pageSize} onChange={(val) => setPageSize(Number(val))} options={pageSizeOptions.map(n => ({ value: n, label: String(n) }))} />
            <Spacer size="sm" />
            <Text variant="caption" color="gray-dark">Total: {filtered.length}</Text>
          </Row>
        </Row>
      )}
    </Column>
  );
};

export default DataTable; 