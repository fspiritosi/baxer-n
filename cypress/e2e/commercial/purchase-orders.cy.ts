import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Órdenes de Compra', () => {
  beforeEach(() => {
    setupClerkTestingToken();
    cy.visit('/');
    cy.window().should((win) => {
      expect(win).to.have.property('Clerk');
      expect(win.Clerk.loaded).to.eq(true);
    });
    cy.clerkSignIn({
      strategy: 'email_code',
      identifier: Cypress.env('test_user'),
    });
  });

  after(() => {
    cy.task('cleanupTestPurchaseOrders').then((result) => {
      cy.log(`Cleanup purchase orders: ${JSON.stringify(result)}`);
    });
  });

  describe('List Purchase Orders', () => {
    it('should navigate to the purchase orders page', () => {
      cy.visit('/dashboard/commercial/purchase-orders');

      cy.contains('h1', 'Órdenes de Compra').should('be.visible');
    });

    it('should have a button to create a new purchase order', () => {
      cy.visit('/dashboard/commercial/purchase-orders');

      cy.contains('button', 'Nueva Orden').should('be.visible');
    });

    it('should display the purchase orders table', () => {
      cy.visit('/dashboard/commercial/purchase-orders');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });

    it('should have search functionality', () => {
      cy.visit('/dashboard/commercial/purchase-orders');

      cy.get('[data-testid="search-input"]').should('be.visible');
      cy.get('[data-testid="search-input"]').type('OC-');
      cy.wait(500);
      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });

  describe('Create Purchase Order', () => {
    it('should navigate to the create page', () => {
      cy.visit('/dashboard/commercial/purchase-orders');

      cy.contains('button', 'Nueva Orden').click();
      cy.url().should('include', '/purchase-orders/new');
    });

    it('should display the creation form with required fields', () => {
      cy.visit('/dashboard/commercial/purchase-orders/new');

      cy.contains('label', 'Proveedor').should('be.visible');
      cy.contains('label', 'Fecha de Emisión').should('be.visible');
    });

    it('should create a new purchase order successfully', () => {
      cy.visit('/dashboard/commercial/purchase-orders/new');

      // Select supplier
      cy.selectOption('Proveedor', '');

      // The supplier select may use a combobox pattern - handle both
      cy.contains('label', 'Proveedor')
        .parent()
        .find('[role="combobox"], button[data-slot="select-trigger"]')
        .click();
      // Select first available supplier
      cy.get('[role="option"]').first().click();

      // Fill delivery address if visible
      cy.get('body').then(($body) => {
        if ($body.find('label:contains("Dirección de Entrega")').length > 0) {
          cy.fillField('Dirección de Entrega', 'Dirección test E2E');
        }
      });

      // Fill notes for cleanup identification
      cy.get('body').then(($body) => {
        if ($body.find('label:contains("Observaciones")').length > 0) {
          cy.fillField('Observaciones', 'test E2E - orden de compra');
        } else if ($body.find('label:contains("Notas")').length > 0) {
          cy.fillField('Notas', 'test E2E - orden de compra');
        }
      });

      // Add a product line
      cy.contains('button', 'Agregar Línea').click();

      // Fill line fields - description, quantity, unit cost, vat rate
      cy.get('body').then(($body) => {
        // Fill Descripción field in the line
        const descInputs = $body.find('input[name*="description"], input[placeholder*="Descripción"]');
        if (descInputs.length > 0) {
          cy.wrap(descInputs.last()).clear().type('Producto test E2E');
        }

        // Fill Cantidad
        const qtyInputs = $body.find(
          'input[name*="quantity"], input[placeholder*="Cantidad"], input[placeholder*="Cant"]'
        );
        if (qtyInputs.length > 0) {
          cy.wrap(qtyInputs.last()).clear().type('10');
        }

        // Fill Costo Unitario
        const costInputs = $body.find(
          'input[name*="unitCost"], input[placeholder*="Costo"], input[placeholder*="Precio"]'
        );
        if (costInputs.length > 0) {
          cy.wrap(costInputs.last()).clear().type('1500');
        }
      });

      // Submit the form
      cy.contains('button', 'Crear Orden de Compra').click();

      // Verify success
      cy.checkToast('creada');
    });
  });

  describe('View Purchase Order Detail', () => {
    it('should display purchase order detail when clicking a row', () => {
      cy.visit('/dashboard/commercial/purchase-orders');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().click();

          // Detail can be a page or a modal
          cy.url().then((url) => {
            if (url.includes('/purchase-orders/')) {
              // Detail page
              cy.contains('OC-').should('be.visible');
            } else {
              // Detail modal
              cy.get('[role="dialog"]').should('be.visible');
            }
          });
        } else {
          cy.log('No purchase orders found, skipping detail test');
        }
      });
    });
  });

  describe('Status Flow - Submit for Approval', () => {
    it('should submit a DRAFT order for approval', () => {
      cy.visit('/dashboard/commercial/purchase-orders');

      // Find a DRAFT order
      cy.get('body').then(($body) => {
        const hasDraft =
          $body.find('td:contains("Borrador")').length > 0 ||
          $body.find('[data-status="DRAFT"]').length > 0;

        if (hasDraft) {
          // Click the first draft row
          cy.contains('td', 'Borrador').first().parents('tr').click();

          // Wait for detail to load
          cy.wait(1000);

          // Click submit for approval button
          cy.contains('button', 'Enviar a Aprobación').click();

          // Confirm if there's a confirmation dialog
          cy.get('body').then(($innerBody) => {
            if ($innerBody.find('[role="alertdialog"]').length > 0) {
              cy.get('[role="alertdialog"]').find('button').contains('Confirmar').click();
            }
          });

          cy.checkToast('aprobación');
        } else {
          cy.log('No DRAFT purchase orders found, skipping submit for approval test');
        }
      });
    });
  });

  describe('Status Flow - Approve', () => {
    it('should approve a PENDING_APPROVAL order', () => {
      cy.visit('/dashboard/commercial/purchase-orders');

      cy.get('body').then(($body) => {
        const hasPending =
          $body.find('td:contains("Pendiente")').length > 0 ||
          $body.find('[data-status="PENDING_APPROVAL"]').length > 0;

        if (hasPending) {
          cy.contains('td', 'Pendiente').first().parents('tr').click();

          cy.wait(1000);

          cy.contains('button', 'Aprobar').click();

          // Confirm if there's a confirmation dialog
          cy.get('body').then(($innerBody) => {
            if ($innerBody.find('[role="alertdialog"]').length > 0) {
              cy.get('[role="alertdialog"]').find('button').contains('Confirmar').click();
            }
          });

          cy.checkToast('aprobada');
        } else {
          cy.log('No PENDING_APPROVAL purchase orders found, skipping approve test');
        }
      });
    });
  });

  describe('Status Flow - Cancel', () => {
    it('should cancel a purchase order', () => {
      cy.visit('/dashboard/commercial/purchase-orders');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          // Click on first row
          cy.get('table tbody tr').first().click();

          cy.wait(1000);

          // Check if cancel button is available
          cy.get('body').then(($innerBody) => {
            if ($innerBody.find('button:contains("Cancelar")').length > 0) {
              cy.contains('button', 'Cancelar').click();

              // Confirm if there's a confirmation dialog
              cy.get('body').then(($dialogBody) => {
                if ($dialogBody.find('[role="alertdialog"]').length > 0) {
                  cy.get('[role="alertdialog"]').find('button').contains('Confirmar').click();
                }
              });

              cy.checkToast('cancelada');
            } else {
              cy.log('Cancel button not available for this order status');
            }
          });
        } else {
          cy.log('No purchase orders found, skipping cancel test');
        }
      });
    });
  });

  describe('Create Purchase Order with Installments', () => {
    it('should show installment manager when toggle is enabled', () => {
      cy.visit('/dashboard/commercial/purchase-orders/new');

      // The toggle should exist
      cy.contains('Dividir en cuotas').should('be.visible');

      // Enable installments
      cy.contains('Dividir en cuotas').parent().find('button[role="switch"]').click();

      // Installment manager should appear
      cy.contains('Generar Cuotas').should('be.visible');
      cy.contains('Cantidad de Cuotas').should('be.visible');
      cy.contains('Fecha Inicio').should('be.visible');
      cy.contains('Frecuencia').should('be.visible');
    });

    it('should create a purchase order with installments', () => {
      cy.visit('/dashboard/commercial/purchase-orders/new');

      // Select supplier
      cy.contains('label', 'Proveedor')
        .parent()
        .find('[role="combobox"], button[data-slot="select-trigger"]')
        .click();
      cy.get('[role="option"]').first().click();

      // Add a product line
      cy.contains('button', 'Agregar línea').click();

      // Fill line fields
      cy.get('body').then(($body) => {
        const descInputs = $body.find('input[name*="description"], input[placeholder*="Descripción"]');
        if (descInputs.length > 0) {
          cy.wrap(descInputs.last()).clear().type('Servicio mensual test E2E');
        }
        const qtyInputs = $body.find('input[name*="quantity"], input[placeholder*="Cantidad"], input[placeholder*="Cant"]');
        if (qtyInputs.length > 0) {
          cy.wrap(qtyInputs.last()).clear().type('3');
        }
        const costInputs = $body.find('input[name*="unitCost"], input[placeholder*="Costo"], input[placeholder*="Precio"]');
        if (costInputs.length > 0) {
          cy.wrap(costInputs.last()).clear().type('10000');
        }
      });

      // Enable installments
      cy.contains('Dividir en cuotas').parent().find('button[role="switch"]').click();

      // Generate 3 monthly installments
      cy.get('input[type="number"]').first().clear().type('3');

      cy.contains('button', 'Generar Cuotas').click();

      // Verify 3 installment rows appeared
      cy.contains('Cuota 1').should('be.visible');
      cy.contains('Cuota 2').should('be.visible');
      cy.contains('Cuota 3').should('be.visible');

      // Fill notes for cleanup identification
      cy.get('body').then(($body) => {
        if ($body.find('label:contains("Observaciones")').length > 0) {
          cy.fillField('Observaciones', 'test E2E - orden con cuotas');
        }
      });

      // Submit
      cy.contains('button', 'Crear Orden de Compra').click();

      cy.checkToast('creada');
    });
  });

  describe('View Installments in Detail', () => {
    it('should display installments section in order detail if present', () => {
      cy.visit('/dashboard/commercial/purchase-orders');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().click();
          cy.wait(1000);

          // Check if the detail page has installments section
          cy.get('body').then(($detailBody) => {
            if ($detailBody.find(':contains("Cuotas / Entregas")').length > 0) {
              cy.contains('Cuotas / Entregas').should('be.visible');
              // Should have installment table with columns
              cy.contains('Fecha Vencimiento').should('be.visible');
              cy.contains('Monto').should('be.visible');
              cy.contains('Estado').should('be.visible');
            } else {
              cy.log('No installments section found - order may not have installments');
            }
          });
        } else {
          cy.log('No purchase orders found, skipping installments detail test');
        }
      });
    });
  });

  describe('Delete DRAFT Order', () => {
    it('should delete a DRAFT purchase order', () => {
      cy.visit('/dashboard/commercial/purchase-orders');

      cy.get('body').then(($body) => {
        const hasDraft =
          $body.find('td:contains("Borrador")').length > 0 ||
          $body.find('[data-status="DRAFT"]').length > 0;

        if (hasDraft) {
          cy.contains('td', 'Borrador').first().parents('tr').click();

          cy.wait(1000);

          cy.contains('button', 'Eliminar').click();

          // Confirm deletion in dialog
          cy.get('body').then(($innerBody) => {
            if ($innerBody.find('[role="alertdialog"]').length > 0) {
              cy.get('[role="alertdialog"]').find('button').contains('Confirmar').click();
            } else if ($innerBody.find('[role="dialog"]').length > 0) {
              cy.get('[role="dialog"]').find('button').contains('Eliminar').click();
            }
          });

          cy.checkToast('eliminada');
        } else {
          cy.log('No DRAFT purchase orders found, skipping delete test');
        }
      });
    });
  });
});
