'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface ExcelColumn {
  /** Key del campo en los datos */
  key: string;
  /** Título de la columna en el Excel */
  title: string;
  /** Ancho de la columna (en caracteres) */
  width?: number;
  /** Función para formatear el valor */
  formatter?: (value: unknown, row: Record<string, unknown>) => string | number | null;
}

export interface ExcelExportOptions {
  /** Nombre del archivo (sin extensión) */
  filename: string;
  /** Nombre de la hoja */
  sheetName?: string;
  /** Título del reporte (se muestra en la primera fila) */
  title?: string;
  /** Incluir fecha de generación */
  includeDate?: boolean;
}

/** Colores del tema */
const THEME = {
  primary: '374151', // gray-700
  headerBg: '6b7280', // gray-500
  headerText: 'FFFFFF',
  alternateRow: 'f9fafb', // gray-50
  border: 'e5e7eb', // gray-200
};

/**
 * Exporta datos a un archivo Excel con estilos
 */
export async function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExcelColumn[],
  options: ExcelExportOptions
): Promise<void> {
  const {
    filename,
    sheetName = 'Datos',
    title,
    includeDate = true,
  } = options;

  // Crear workbook y worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Gestión';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', ySplit: title ? 3 : 1 }],
  });

  let currentRow = 1;

  // Título del reporte (opcional)
  if (title) {
    worksheet.mergeCells(currentRow, 1, currentRow, columns.length);
    const titleCell = worksheet.getCell(currentRow, 1);
    titleCell.value = title;
    titleCell.font = {
      bold: true,
      size: 16,
      color: { argb: THEME.primary },
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(currentRow).height = 30;
    currentRow++;

    // Fecha de generación
    if (includeDate) {
      worksheet.mergeCells(currentRow, 1, currentRow, columns.length);
      const dateCell = worksheet.getCell(currentRow, 1);
      dateCell.value = `Generado: ${new Date().toLocaleString('es-AR')}`;
      dateCell.font = { size: 10, italic: true, color: { argb: '666666' } };
      dateCell.alignment = { horizontal: 'center' };
      currentRow++;
    }

    // Fila vacía
    currentRow++;
  }

  // Encabezados
  const headerRow = worksheet.getRow(currentRow);
  columns.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.title;
    cell.font = {
      bold: true,
      color: { argb: THEME.headerText },
      size: 11,
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: THEME.headerBg },
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    cell.border = {
      top: { style: 'thin', color: { argb: THEME.border } },
      bottom: { style: 'thin', color: { argb: THEME.border } },
      left: { style: 'thin', color: { argb: THEME.border } },
      right: { style: 'thin', color: { argb: THEME.border } },
    };
  });
  headerRow.height = 25;
  currentRow++;

  // Datos
  data.forEach((item, rowIndex) => {
    const row = worksheet.getRow(currentRow + rowIndex);
    const isAlternate = rowIndex % 2 === 1;

    columns.forEach((col, colIndex) => {
      const cell = row.getCell(colIndex + 1);

      // Obtener valor (soporta nested keys como "contact.firstName")
      let value = getNestedValue(item, col.key);

      // Aplicar formatter si existe
      if (col.formatter) {
        value = col.formatter(value, item);
      } else if (value && typeof value === 'object') {
        // Auto-extraer 'name' de objetos de relación si no hay formatter
        const objValue = value as Record<string, unknown>;
        if ('name' in objValue) {
          value = objValue.name;
        } else if ('firstName' in objValue && 'lastName' in objValue) {
          // Para objetos como employee con firstName/lastName
          value = `${objValue.lastName}, ${objValue.firstName}`;
        } else {
          // Fallback: convertir a string vacío para evitar [object Object]
          value = '';
        }
      }

      cell.value = (value as string | number | boolean | Date | null) ?? '';
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: THEME.border } },
        bottom: { style: 'thin', color: { argb: THEME.border } },
        left: { style: 'thin', color: { argb: THEME.border } },
        right: { style: 'thin', color: { argb: THEME.border } },
      };

      // Fila alternada
      if (isAlternate) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: THEME.alternateRow },
        };
      }
    });

    row.height = 20;
  });

  // Configurar anchos de columna
  columns.forEach((col, index) => {
    const column = worksheet.getColumn(index + 1);
    column.width = col.width || calculateColumnWidth(col, data);
  });

  // Agregar autofiltro en los encabezados
  const headerRowNumber = title ? (includeDate ? 4 : 3) : 1;
  worksheet.autoFilter = {
    from: { row: headerRowNumber, column: 1 },
    to: { row: headerRowNumber, column: columns.length },
  };

  // Generar y descargar
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${filename}.xlsx`);
}

/**
 * Obtiene un valor anidado de un objeto usando dot notation
 * Ejemplo: getNestedValue({ contact: { name: 'Juan' } }, 'contact.name') => 'Juan'
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  }, obj as unknown);
}

/**
 * Calcula el ancho óptimo de una columna basado en el contenido
 */
function calculateColumnWidth<T extends Record<string, unknown>>(
  column: ExcelColumn,
  data: T[]
): number {
  const MIN_WIDTH = 10;
  const MAX_WIDTH = 50;
  const PADDING = 2;

  // Ancho del título
  let maxWidth = column.title.length;

  // Ancho máximo del contenido (muestreamos los primeros 100 registros)
  const sample = data.slice(0, 100);
  for (const item of sample) {
    let value = getNestedValue(item, column.key);
    if (column.formatter) {
      value = column.formatter(value, item);
    } else if (value && typeof value === 'object') {
      // Auto-extraer 'name' de objetos de relación
      const objValue = value as Record<string, unknown>;
      if ('name' in objValue) {
        value = objValue.name;
      } else if ('firstName' in objValue && 'lastName' in objValue) {
        value = `${objValue.lastName}, ${objValue.firstName}`;
      } else {
        value = '';
      }
    }
    const length = String(value ?? '').length;
    if (length > maxWidth) {
      maxWidth = length;
    }
  }

  return Math.min(Math.max(maxWidth + PADDING, MIN_WIDTH), MAX_WIDTH);
}

/**
 * Convierte columnas de TanStack Table a ExcelColumns
 * Extrae el meta.title y accessorKey
 */
export function tanstackColumnsToExcelColumns<T extends Record<string, unknown>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: any[],
  options?: {
    /** Columnas a excluir por accessorKey o id */
    exclude?: string[];
    /** Formatters personalizados por key */
    formatters?: Record<string, (value: unknown, row: T) => string | number | null>;
  }
): ExcelColumn[] {
  const { exclude = ['select', 'actions'], formatters = {} } = options || {};

  return columns
    .filter((col) => {
      const key = col.accessorKey || col.id;
      return key && !exclude.includes(key);
    })
    .map((col) => {
      const key = col.accessorKey || col.id;
      const title = col.meta?.title || key;

      return {
        key,
        title,
        formatter: formatters[key] as ExcelColumn['formatter'],
      };
    });
}
