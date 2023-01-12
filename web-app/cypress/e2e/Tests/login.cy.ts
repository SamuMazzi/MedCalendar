/// <reference types="cypress" />

// https://on.cypress.io/introduction-to-cypress

function selectMedicoLogin(nome_med: string) {
  cy.get('[placeholder="Seleziona il medico"]').as('med_automplete')
  cy.get('@med_automplete').type(nome_med)
  cy.get('@med_automplete').get('ul > li[data-option-index=0]').click();
}

describe('Med scheduler', () => {
  const nome_med = 'Medico Demo'
  beforeEach(() => {
    cy.visit("/")
  })

  context('Classic login', () => {
    it('Enter normal doctor page', () => {
      cy.get('Amministrazione').should('not.exist')
      cy.get('[data-cy="text_change_mod"]').should('have.text', 'Sei un amministratore? Clicca qua')
      cy.url().should('include', '/login')
      cy.contains('Accedi')
      cy.get('[data-cy="logo_image_appbar"]').should('exist')
      cy.get('[data-cy="profile_button"]').should('not.exist')
    })
  
    it('Type med and select', () => {
      //[data-cy="autocomplete_cy"]
      cy.get('[placeholder="Seleziona il medico"]').as('med_automplete')
      cy.get('@med_automplete').should("exist").should('have.value', '')
      selectMedicoLogin(nome_med)
      cy.get('@med_automplete').should("exist").should('have.value', nome_med)
      //MuiAutocomplete-option
    })
  
    it('Type password', () => {
      const pass = Cypress.env("passwordLogin");
      //[data-cy="password_login_med"]
      cy.get('[placeholder="Inserisci la password"]').as('pass_formField')
      cy.get('@pass_formField').should("exist").should('have.value', '')
      cy.get('@pass_formField').type(pass)
      cy.get('@pass_formField').should('have.value', pass)
    })
  
    it('Login', () => {
      selectMedicoLogin(nome_med)
      
      cy.get('[placeholder="Inserisci la password"]').as('pass_formField')
      cy.get('@pass_formField').type('password')

      cy.get('[data-cy="button_login"]').click()
      cy.contains('distretto')
      cy.get('@pass_formField').should('not.exist')
      cy.get('@med_automplete').should('not.exist')
      cy.get('[data-cy="profile_button"]').should('exist')
    })
  })


  it('Change mod', () => {
    cy.get('[data-cy="change_mod_login"]').click()
    cy.contains('Amministrazione')
  })

  it('Click on logo doesn\'t change page', () => {
    cy.get('[data-cy="logo_image_appbar"]').should('exist')
    cy.contains('Accedi')
  })

  it('Press clear button', () => {
    selectMedicoLogin(nome_med)
    cy.get('[data-testid="CloseIcon"]').should('exist').click()
    cy.get('@med_automplete').should('have.value', '')
  })

  it('Type wrong password', () => {
    selectMedicoLogin(nome_med)

    cy.get('[placeholder="Inserisci la password"]').as('pass_formField')
    cy.get('@pass_formField').type("password")
    cy.get('[data-cy="button_login"]').click()
    cy.contains('Password sbagliata')
  })
  /*
  context('with a checked task', () => {

    it('can filter for uncompleted tasks', () => {
      // We'll click on the "active" button in order to
      // display only incomplete items
      cy.contains('Active').click()

      // After filtering, we can assert that there is only the one
      // incomplete item in the list.
      cy.get('.todo-list li')
        .should('have.length', 1)
        .first()
        .should('have.text', 'Walk the dog')

      // For good measure, let's also assert that the task we checked off
      // does not exist on the page.
      cy.contains('Pay electric bill').should('not.exist')
    })


  }) */
})
