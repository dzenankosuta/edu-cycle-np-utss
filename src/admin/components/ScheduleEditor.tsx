import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useAdminSchedule } from '../hooks/useAdminSchedule';
import { ConfirmDialog } from './ConfirmDialog';
import type { ClassPeriod } from '../../types';

type ShiftType = 'firstShift' | 'secondShift';

interface EditingPeriod {
  shift: ShiftType;
  index: number;
  period: ClassPeriod;
}

interface NewPeriod {
  shift: ShiftType;
  period: ClassPeriod;
}

export function ScheduleEditor() {
  const { schedule, isLoading, error, updatePeriod, addPeriod, deletePeriod, clearError } =
    useAdminSchedule();

  const [activeTab, setActiveTab] = useState<ShiftType>('firstShift');
  const [editingPeriod, setEditingPeriod] = useState<EditingPeriod | null>(null);
  const [newPeriod, setNewPeriod] = useState<NewPeriod | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    shift: ShiftType;
    index: number;
  } | null>(null);

  const validateTime = (time: string): boolean => {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  };

  const handleEdit = (shift: ShiftType, index: number, period: ClassPeriod) => {
    setEditingPeriod({ shift, index, period: { ...period } });
    setNewPeriod(null);
  };

  const handleCancelEdit = () => {
    setEditingPeriod(null);
  };

  const handleSaveEdit = async () => {
    if (!editingPeriod) return;

    const { shift, index, period } = editingPeriod;

    if (!period.class.trim()) {
      alert('Naziv časa je obavezan');
      return;
    }

    if (!validateTime(period.start) || !validateTime(period.end)) {
      alert('Vreme mora biti u formatu HH:MM');
      return;
    }

    try {
      await updatePeriod(shift, index, period);
      setEditingPeriod(null);
    } catch (err) {
      // Error je već postavljen u hook-u
    }
  };

  const handleStartAdd = () => {
    setNewPeriod({
      shift: activeTab,
      period: { class: '', start: '', end: '' },
    });
    setEditingPeriod(null);
  };

  const handleCancelAdd = () => {
    setNewPeriod(null);
  };

  const handleSaveAdd = async () => {
    if (!newPeriod) return;

    const { shift, period } = newPeriod;

    if (!period.class.trim()) {
      alert('Naziv časa je obavezan');
      return;
    }

    if (!validateTime(period.start) || !validateTime(period.end)) {
      alert('Vreme mora biti u formatu HH:MM');
      return;
    }

    try {
      await addPeriod(shift, period);
      setNewPeriod(null);
    } catch (err) {
      // Error je već postavljen u hook-u
    }
  };

  const handleDeleteClick = (shift: ShiftType, index: number) => {
    setDeleteConfirm({ shift, index });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deletePeriod(deleteConfirm.shift, deleteConfirm.index);
      setDeleteConfirm(null);
    } catch (err) {
      // Error je već postavljen u hook-u
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-loader"></div>
        <p>Učitavanje rasporeda...</p>
      </div>
    );
  }

  const currentShift = schedule?.[activeTab] || [];

  return (
    <div className="schedule-editor">
      <div className="schedule-editor-header">
        <h2>Upravljanje Rasporedom</h2>
        {error && (
          <div className="admin-error">
            <span>{error}</span>
            <button onClick={clearError}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="schedule-tabs">
        <button
          className={`schedule-tab ${activeTab === 'firstShift' ? 'active' : ''}`}
          onClick={() => setActiveTab('firstShift')}
        >
          Prva Smena
        </button>
        <button
          className={`schedule-tab ${activeTab === 'secondShift' ? 'active' : ''}`}
          onClick={() => setActiveTab('secondShift')}
        >
          Druga Smena
        </button>
      </div>

      <div className="schedule-table-wrapper">
        <table className="schedule-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Naziv</th>
              <th style={{ width: '100px' }}>Početak</th>
              <th style={{ width: '100px' }}>Kraj</th>
              <th style={{ width: '100px' }}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {currentShift.map((period, index) => {
              const isEditing =
                editingPeriod?.shift === activeTab && editingPeriod?.index === index;

              return (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={isEditing ? 'editing' : ''}
                >
                  <td className="period-number">{index + 1}</td>
                  {isEditing ? (
                    <>
                      <td>
                        <input
                          type="text"
                          className="admin-input"
                          value={editingPeriod.period.class}
                          onChange={(e) =>
                            setEditingPeriod({
                              ...editingPeriod,
                              period: { ...editingPeriod.period, class: e.target.value },
                            })
                          }
                          placeholder="Naziv časa"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="admin-input admin-input--time"
                          value={editingPeriod.period.start}
                          onChange={(e) =>
                            setEditingPeriod({
                              ...editingPeriod,
                              period: { ...editingPeriod.period, start: e.target.value },
                            })
                          }
                          placeholder="HH:MM"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="admin-input admin-input--time"
                          value={editingPeriod.period.end}
                          onChange={(e) =>
                            setEditingPeriod({
                              ...editingPeriod,
                              period: { ...editingPeriod.period, end: e.target.value },
                            })
                          }
                          placeholder="HH:MM"
                        />
                      </td>
                      <td className="actions">
                        <button
                          className="admin-icon-btn admin-icon-btn--success"
                          onClick={handleSaveEdit}
                          title="Sačuvaj"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          className="admin-icon-btn admin-icon-btn--secondary"
                          onClick={handleCancelEdit}
                          title="Otkaži"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{period.class}</td>
                      <td>{period.start}</td>
                      <td>{period.end}</td>
                      <td className="actions">
                        <button
                          className="admin-icon-btn"
                          onClick={() => handleEdit(activeTab, index, period)}
                          title="Izmeni"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="admin-icon-btn admin-icon-btn--danger"
                          onClick={() => handleDeleteClick(activeTab, index)}
                          title="Obriši"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </>
                  )}
                </motion.tr>
              );
            })}

            {newPeriod && newPeriod.shift === activeTab && (
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="editing new-row"
              >
                <td className="period-number">{currentShift.length + 1}</td>
                <td>
                  <input
                    type="text"
                    className="admin-input"
                    value={newPeriod.period.class}
                    onChange={(e) =>
                      setNewPeriod({
                        ...newPeriod,
                        period: { ...newPeriod.period, class: e.target.value },
                      })
                    }
                    placeholder="Naziv časa"
                    autoFocus
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="admin-input admin-input--time"
                    value={newPeriod.period.start}
                    onChange={(e) =>
                      setNewPeriod({
                        ...newPeriod,
                        period: { ...newPeriod.period, start: e.target.value },
                      })
                    }
                    placeholder="HH:MM"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="admin-input admin-input--time"
                    value={newPeriod.period.end}
                    onChange={(e) =>
                      setNewPeriod({
                        ...newPeriod,
                        period: { ...newPeriod.period, end: e.target.value },
                      })
                    }
                    placeholder="HH:MM"
                  />
                </td>
                <td className="actions">
                  <button
                    className="admin-icon-btn admin-icon-btn--success"
                    onClick={handleSaveAdd}
                    title="Dodaj"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    className="admin-icon-btn admin-icon-btn--secondary"
                    onClick={handleCancelAdd}
                    title="Otkaži"
                  >
                    <X size={18} />
                  </button>
                </td>
              </motion.tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="schedule-actions">
        <button
          className="admin-btn admin-btn--primary"
          onClick={handleStartAdd}
          disabled={!!newPeriod || !!editingPeriod}
        >
          <Plus size={20} />
          <span>Dodaj Čas</span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Brisanje časa"
        message="Da li ste sigurni da želite da obrišete ovaj čas? Ova akcija se ne može poništiti."
        confirmText="Obriši"
        cancelText="Otkaži"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        variant="danger"
      />
    </div>
  );
}
