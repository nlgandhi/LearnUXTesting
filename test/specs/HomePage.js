// ----------------------------------------------------------------------------------------------------------------------
// You should have one flow per page. Ideally more than 1 flow per page.
// There are Pros and Cons of integrating or keeping the e2e tests seperate. 
// David and Nitin prefer to keep it separate.  The e2e tests don't have to go through the rigourous PR code review etc.
// Selectors: Class, ID, XPath or Attributes of the element. Example - Href, Tittle or data-testId. 
// Prefered approach use data-testId for Unit and e2e testing.
// Deploy this code to a Docker container (AWS Instance).
// ----------------------------------------------------------------------------------------------------------------------  
describe('Home Page e2e tests', () => {
    
    it('should have the right title', () => {
        browser.url('')
        const title = browser.getTitle()
        expect(browser).toHaveTitle('Homes for Sale, Mortgage Rates, Virtual Tours & Rentals | realtor.com®');
    })

    it('should go to rentals page', () => {
        browser.url('')
        const rentalsLink = $('[href="/rentals"]');
        rentalsLink.click(); // Click on the link
        const title = browser.getTitle(); // Get the tittle for the new page.
        expect(title).toEqual('Apartments for Rent, Condos and Home Rentals | Rental Home Property Search | realtor.com®');
    });

    /*
    it('Find Your Neighborhood section exists', () => {
        browser.url('')
        const elem  = $('jsx-3406475629');
        // const elem  = $('jsx-3406475629 headline-secondary');        
        console.log(elem.getText());
        expect(elem.getText()).toEqual('Find Your Neighborhood');         
    });
    */



})

