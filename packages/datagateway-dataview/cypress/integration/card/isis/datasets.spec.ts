describe('ISIS - Datasets Cards', () => {
  beforeEach(() => {
    cy.intercept('**/datasets/count*').as('getDatasetsCount');
    cy.intercept('**/datasets?order*').as('getDatasetsOrder');
    cy.login();
    cy.visit(
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset'
    ).wait(['@getDatasetsCount', '@getDatasetsOrder', '@getDatasetsOrder'], {
      timeout: 10000,
    });
    cy.get('[aria-label="page-view Display as cards"]')
      .click()
      .wait(['@getDatasetsOrder'], {
        timeout: 10000,
      });
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway DataView');
    cy.get('#datagateway-dataview').should('be.visible');
  });

  it('should be able to click an investigation to see its datasets', () => {
    cy.get('[data-testid="card"]')
      .contains('DATASET 97')
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset/97'
    );
  });

  it('should be able to sort by one field', () => {
    cy.contains('[role="button"]', 'Name').click().wait('@getDatasetsOrder', {
      timeout: 10000,
    });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').contains('DATASET 337');

    cy.contains('[role="button"]', 'Name').click().wait('@getDatasetsOrder', {
      timeout: 10000,
    });
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('exist');
    cy.get('[data-testid="card"]').contains('DATASET 97');

    cy.contains('[role="button"]', 'Name').click();
    cy.contains('[role="button"]', 'asc').should('not.exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').contains('DATASET 97');
  });

  it('should be able to sort by multiple fields', () => {
    cy.contains('[role="button"]', 'Create Time')
      .click()
      .wait('@getDatasetsOrder', {
        timeout: 10000,
      });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').contains('DATASET 337');

    cy.contains('[role="button"]', 'Name').click().wait('@getDatasetsOrder', {
      timeout: 10000,
    });
    cy.contains('[role="button"]', 'asc').should('exist');
    cy.contains('[role="button"]', 'desc').should('not.exist');
    cy.get('[data-testid="card"]').contains('DATASET 337');
  });

  it('should be able to filter by multiple fields', () => {
    cy.get('[aria-label="advanced-filters-link"]').click();
    cy.get('[aria-label="Filter by Name"]')
      .first()
      .type('337')
      .wait(['@getDatasetsCount', '@getDatasetsOrder'], { timeout: 10000 });
    cy.get('[data-testid="card"]').contains('DATASET 337');
    // check that size is correct after filtering
    cy.get('[data-testid="card"]').contains('5.15 GB');

    cy.get('input[id="Create Time filter from"]')
      .type('2019-01-01')
      .wait(['@getDatasetsCount'], { timeout: 10000 });
    cy.get('button[aria-label="Create Time filter to, date picker"]')
      .parent()
      .find('button')
      .click();
    cy.get('.MuiPickersDay-day[tabindex="0"]').first().click();
    cy.contains('OK').click().wait(['@getDatasetsCount'], { timeout: 10000 });
    const date = new Date();
    date.setDate(1);
    cy.get('input[id="Create Time filter to"]').should(
      'have.value',
      date.toISOString().slice(0, 10)
    );
    cy.get('[data-testid="card"]').should('not.exist');
  });

  it('should be able to expand "More Information"', () => {
    cy.get('[data-testid="card"]')
      .contains('More Information')
      .click({ force: true });
    cy.get('[data-testid="card"]')
      .get('[aria-label="card-more-information"]')
      .contains('DATASET 97');
    cy.get('#dataset-type-tab').click({ force: true });
    cy.get('[data-testid="card"]')
      .get('[aria-label="card-more-information"]')
      .contains('DATASETTYPE 1');
    cy.get('#dataset-datafiles-tab').click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/16/investigation/97/dataset/97/datafile'
    );
  });
});
