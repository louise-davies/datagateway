describe('ISIS - Datasets Table', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/browse/instrument/1/facilityCycle/14/investigation/87/dataset');
  });

  it('should load correctly', () => {
    cy.title().should('equal', 'DataGateway Table');
    cy.get('#datagateway-table').should('be.visible');
  });

  it('should be able to click a dataset to see its datafiles', () => {
    cy.get('[role="gridcell"] a')
      .first()
      .click({ force: true });
    cy.location('pathname').should(
      'eq',
      '/browse/instrument/1/facilityCycle/14/investigation/87/dataset/118/datafile'
    );
  });

  // current example data only has 2 datasets in the investigation,
  // so cannot test lazy loading.
  it.skip('should be able to scroll down and load more rows', () => {
    cy.get('[aria-rowcount="50"]').should('exist');
    cy.get('[aria-label="grid"]').scrollTo('bottom');
    cy.get('[aria-rowcount="75"]').should('exist');
  });

  describe('should be able to sort by', () => {
    it('ascending order', () => {
      cy.contains('Name').click();

      cy.get('[aria-sort="ascending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('be.visible');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('DATASET 327');
    });

    it('descending order', () => {
      cy.contains('Name').click();
      cy.contains('Name').click();

      cy.get('[aria-sort="descending"]').should('exist');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'not.have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('DATASET 87');
    });

    it('no order', () => {
      cy.contains('Name').click();
      cy.contains('Name').click();
      cy.contains('Name').click();

      cy.get('[aria-sort="ascending"]').should('not.exist');
      cy.get('[aria-sort="descending"]').should('not.exist');
      cy.get('.MuiTableSortLabel-iconDirectionAsc').should('not.be.visible');
      cy.get('.MuiTableSortLabel-iconDirectionDesc').should(
        'have.css',
        'opacity',
        '0'
      );
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('DATASET 87');
    });

    it('multiple columns', () => {
      cy.contains('Create Time').click();
      cy.contains('Create Time').click();
      cy.contains('Name').click();
      cy.contains('Name').click();

      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('DATASET 87');
    });
  });

  describe('should be able to filter by', () => {
    it('text', () => {
      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .type('DATASET 327');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="4"]').contains(
        '2005-06-12 08:15:28'
      );
    });

    it('date between', () => {
      cy.get('[aria-label="Create Time date filter from"]').type('2005-06-12');

      cy.get('[aria-label="Create Time date filter to"]')
        .parent()
        .find('button')
        .click();

      cy.get('.MuiPickersDay-day[tabindex="0"]')
        .first()
        .click();

      cy.contains('OK').click();

      let date = new Date();
      date.setDate(1);

      cy.get('[aria-label="Create Time date filter to"]').should(
        'have.value',
        date.toISOString().slice(0, 10)
      );

      cy.get('[aria-rowcount="2"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('DATASET 87');
    });

    it('multiple columns', () => {
      cy.get('[aria-label="Filter by Name"]')
        .find('input')
        .type('87');

      cy.get('[aria-label="Create Time date filter to"]').type('2007-06-23');

      cy.get('[aria-rowcount="1"]').should('exist');
      cy.get('[aria-rowindex="1"] [aria-colindex="2"]').contains('DATASET 87');
    });
  });

  describe('should be able to view details', () => {
    it('when no other row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.contains('Name: DATASET 87').should('be.visible');
      cy.get('[aria-label="Hide details"]').should('exist');
    });

    it('when another other row is showing details', () => {
      cy.get('[aria-label="Show details"]')
        .eq(1)
        .click();

      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.contains('Name: DATASET 87').should('be.visible');
      cy.contains('Name: DATASET 327').should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('have.length', 1);
    });

    it('and view dataset details and type', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.get('[aria-controls="dataset-details-panel"]').should('be.visible');

      cy.contains(
        'Description: Onto wind media return. Cultural area while friend who rich detail.\nWord allow education.\nAcross share be. Along month decide eye. Media foot war available organization could performance.'
      ).should('be.visible');

      cy.get('[aria-controls="dataset-type-panel"]').should('be.visible');
      cy.get('[aria-controls="dataset-type-panel"]').click();

      cy.contains(
        'Description: Many last prepare small. Maintain throw hope parent.\nEntire soon option bill fish against power.\nRather why rise month shake voice.'
      ).should('be.visible');
    });

    it('and then not view details anymore', () => {
      cy.get('[aria-label="Show details"]')
        .first()
        .click();

      cy.get('[aria-label="Hide details"]')
        .first()
        .click();

      cy.contains('Name: DATASET 87').should('not.be.visible');
      cy.get('[aria-label="Hide details"]').should('not.exist');
    });
  });
});
