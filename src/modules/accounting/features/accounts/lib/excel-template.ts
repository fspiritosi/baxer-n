/**
 * Plantilla Excel para importación de Plan de Cuentas
 *
 * Este archivo genera una plantilla Excel con instrucciones para que los usuarios
 * puedan cargar su plan de cuentas de forma masiva.
 */

import ExcelJS from 'exceljs';
import { AccountType, AccountNature } from '@/generated/prisma/enums';

/** Colores del tema */
const THEME = {
  primary: '374151',
  success: '10b981',
  warning: 'f59e0b',
  headerBg: '6b7280',
  headerText: 'FFFFFF',
  instructionBg: 'dbeafe',
  exampleBg: 'fef3c7',
  border: 'e5e7eb',
};

/**
 * Genera una plantilla Excel vacía para importar el plan de cuentas
 */
export async function generateAccountsTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Gestión';
  workbook.created = new Date();

  // Hoja 1: Plantilla para completar
  const dataSheet = workbook.addWorksheet('Plan de Cuentas', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  // Encabezados
  const headers = [
    'Código',
    'Nombre',
    'Tipo',
    'Naturaleza',
    'Descripción (Opcional)',
    'Código Padre (Opcional)',
  ];

  const headerRow = dataSheet.getRow(1);
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
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

  // Configurar anchos de columna
  dataSheet.getColumn(1).width = 15; // Código
  dataSheet.getColumn(2).width = 35; // Nombre
  dataSheet.getColumn(3).width = 15; // Tipo
  dataSheet.getColumn(4).width = 15; // Naturaleza
  dataSheet.getColumn(5).width = 40; // Descripción
  dataSheet.getColumn(6).width = 15; // Código Padre

  // Nota: Las validaciones de datos se pueden agregar manualmente en Excel
  // o implementar con fórmulas personalizadas si es necesario

  // Agregar filtros
  dataSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headers.length },
  };

  // Hoja 2: Instrucciones
  const instructionsSheet = workbook.addWorksheet('Instrucciones');

  let currentRow = 1;

  // Título
  instructionsSheet.mergeCells(currentRow, 1, currentRow, 2);
  const titleCell = instructionsSheet.getCell(currentRow, 1);
  titleCell.value = '📋 Instrucciones para Importar Plan de Cuentas';
  titleCell.font = { bold: true, size: 16, color: { argb: THEME.primary } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  instructionsSheet.getRow(currentRow).height = 30;
  currentRow += 2;

  // Instrucciones generales
  const instructions = [
    {
      title: '1. Estructura del Código Contable',
      points: [
        'Use códigos jerárquicos separados por puntos (ej: 1.1.1, 1.1.2)',
        'El primer nivel representa la categoría principal (1 = Activo, 2 = Pasivo, etc.)',
        'Los niveles subsiguientes representan subcuentas',
        'Ejemplo: 1.1.1.01 → Activo (1) > Corriente (1.1) > Caja (1.1.1) > Caja General (1.1.1.01)',
      ],
    },
    {
      title: '2. Tipos de Cuenta',
      points: [
        'ASSET: Activo (recursos que posee la empresa)',
        'LIABILITY: Pasivo (obligaciones de la empresa)',
        'EQUITY: Patrimonio Neto (capital de los propietarios)',
        'INCOME: Ingresos (ventas, ganancias)',
        'EXPENSE: Gastos (costos operativos)',
      ],
    },
    {
      title: '3. Naturaleza de la Cuenta',
      points: [
        'DEBIT: Saldo Deudor (Activo y Gastos)',
        'CREDIT: Saldo Acreedor (Pasivo, Patrimonio e Ingresos)',
      ],
    },
    {
      title: '4. Jerarquía (Código Padre)',
      points: [
        'Deje en blanco para cuentas de nivel superior',
        'Ingrese el código de la cuenta padre para crear una subcuenta',
        'Ejemplo: Para crear "1.1.1.01" con padre "1.1.1", ingrese "1.1.1" en Código Padre',
        'La cuenta padre debe existir (ingresarla primero en filas anteriores)',
      ],
    },
    {
      title: '5. Consejos',
      points: [
        'Complete las cuentas en orden jerárquico (primero nivel 1, luego nivel 2, etc.)',
        'Use nombres descriptivos y concisos',
        'La descripción es opcional pero recomendada para aclarar el propósito',
        'Evite duplicar códigos',
        'Revise la hoja "Ejemplo" para ver cuentas de muestra',
      ],
    },
  ];

  instructions.forEach((section) => {
    // Título de sección
    instructionsSheet.mergeCells(currentRow, 1, currentRow, 2);
    const sectionCell = instructionsSheet.getCell(currentRow, 1);
    sectionCell.value = section.title;
    sectionCell.font = { bold: true, size: 12, color: { argb: THEME.primary } };
    sectionCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: THEME.instructionBg },
    };
    sectionCell.alignment = { vertical: 'middle' };
    instructionsSheet.getRow(currentRow).height = 22;
    currentRow++;

    // Puntos
    section.points.forEach((point) => {
      instructionsSheet.mergeCells(currentRow, 1, currentRow, 2);
      const pointCell = instructionsSheet.getCell(currentRow, 1);
      pointCell.value = `  • ${point}`;
      pointCell.alignment = { wrapText: true, vertical: 'top' };
      instructionsSheet.getRow(currentRow).height = 20;
      currentRow++;
    });

    currentRow++;
  });

  // Configurar anchos
  instructionsSheet.getColumn(1).width = 80;
  instructionsSheet.getColumn(2).width = 20;

  // Hoja 3: Ejemplo
  const exampleSheet = workbook.addWorksheet('Ejemplo');

  const exampleHeaders = [...headers];
  const exampleHeaderRow = exampleSheet.getRow(1);
  exampleHeaders.forEach((header, index) => {
    const cell = exampleHeaderRow.getCell(index + 1);
    cell.value = header;
    cell.font = {
      bold: true,
      color: { argb: THEME.headerText },
      size: 11,
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: THEME.success },
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
  });
  exampleHeaderRow.height = 25;

  // Datos de ejemplo
  const exampleData = [
    ['1', 'ACTIVO', 'ASSET', 'DEBIT', 'Bienes y derechos de la empresa', ''],
    ['1.1', 'ACTIVO CORRIENTE', 'ASSET', 'DEBIT', 'Activos liquidables en el corto plazo', '1'],
    ['1.1.1', 'CAJA Y BANCOS', 'ASSET', 'DEBIT', 'Disponibilidades', '1.1'],
    ['1.1.1.01', 'Caja General', 'ASSET', 'DEBIT', 'Efectivo en caja', '1.1.1'],
    ['1.1.1.02', 'Banco Nación - CC', 'ASSET', 'DEBIT', 'Cuenta corriente Banco Nación', '1.1.1'],
    ['2', 'PASIVO', 'LIABILITY', 'CREDIT', 'Obligaciones de la empresa', ''],
    ['2.1', 'PASIVO CORRIENTE', 'LIABILITY', 'CREDIT', 'Deudas a corto plazo', '2'],
    ['2.1.1', 'PROVEEDORES', 'LIABILITY', 'CREDIT', 'Cuentas por pagar a proveedores', '2.1'],
    ['3', 'PATRIMONIO NETO', 'EQUITY', 'CREDIT', 'Capital y resultados', ''],
    ['3.1', 'CAPITAL', 'EQUITY', 'CREDIT', 'Aportes de los socios', '3'],
    ['4', 'INGRESOS', 'INCOME', 'CREDIT', 'Ventas y otros ingresos', ''],
    ['4.1', 'VENTAS', 'INCOME', 'CREDIT', 'Ingresos por ventas', '4'],
    ['5', 'GASTOS', 'EXPENSE', 'DEBIT', 'Costos operativos', ''],
    ['5.1', 'GASTOS ADMINISTRATIVOS', 'EXPENSE', 'DEBIT', 'Gastos de administración', '5'],
  ];

  exampleData.forEach((rowData, index) => {
    const row = exampleSheet.getRow(index + 2);
    rowData.forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      cell.value = value;
      cell.alignment = { vertical: 'middle' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: THEME.exampleBg },
      };
    });
    row.height = 20;
  });

  // Configurar anchos
  exampleSheet.getColumn(1).width = 15;
  exampleSheet.getColumn(2).width = 35;
  exampleSheet.getColumn(3).width = 15;
  exampleSheet.getColumn(4).width = 15;
  exampleSheet.getColumn(5).width = 40;
  exampleSheet.getColumn(6).width = 15;

  // Generar buffer
  return Buffer.from(await workbook.xlsx.writeBuffer());
}
