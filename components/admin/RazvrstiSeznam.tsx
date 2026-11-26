"use client";

// Seznam, ki ga razvrščaš z vlečenjem (miška ali prst).
// Primi za ročko ⋮⋮ na levi in povleci vrstico gor ali dol.
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

type Props<T> = {
  items: T[];
  getId: (item: T) => string | number;
  onReorder: (nova: T[]) => void;
  renderItem: (item: T, index: number, rocka: ReactNode) => ReactNode;
  className?: string;
  itemClassName?: string;
};

function Vrstica({
  id,
  children,
  className,
}: {
  id: string | number;
  children: (rocka: ReactNode) => ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const rocka = (
    <button
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      type="button"
      aria-label="Povleci za premik"
      className="shrink-0 cursor-grab touch-none rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-brand-navy active:cursor-grabbing"
    >
      <GripVertical size={18} />
    </button>
  );
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${className || ""} ${isDragging ? "relative z-10 bg-orange-50 shadow-lg" : ""}`}
    >
      {children(rocka)}
    </li>
  );
}

export default function RazvrstiSeznam<T>({ items, getId, onReorder, renderItem, className, itemClassName }: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const konec = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const iz = items.findIndex((x) => getId(x) === active.id);
    const v = items.findIndex((x) => getId(x) === over.id);
    if (iz < 0 || v < 0) return;
    onReorder(arrayMove(items, iz, v));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={konec}>
      <SortableContext items={items.map(getId)} strategy={verticalListSortingStrategy}>
        <ul className={className}>
          {items.map((item, i) => (
            <Vrstica key={getId(item)} id={getId(item)} className={itemClassName}>
              {(rocka) => renderItem(item, i, rocka)}
            </Vrstica>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
