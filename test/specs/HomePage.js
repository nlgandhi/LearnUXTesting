// ----------------------------------------------------------------------------------------------------------------------
// You should have one flow per page. Ideally more than 1 flow per page.
// There are Pros and Cons of integrating or keeping the e2e tests seperate. 
// David and Nitin prefer to keep it separate.  The e2e tests don't have to go through the rigourous PR code review etc.
// Selectors: Class, ID, XPath or Attributes of the element. Example - Href, Tittle or data-testId. 
// Prefered approach use data-testId for Unit and e2e testing.
// Deploy this code to a Docker container (AWS Instance).
// ----------------------------------------------------------------------------------------------------------------------  
describe('Home Page e2e tests', () => {
    it('Check if the Trends section exists', () => {

        // browser.url('https://realtor.com')
        browser.url('')
        const elem = $('.news-headline'); // Get the element from using the class
        expect(elem.getText()).toEqual('The Most Popular Homes of the Week'); //        
    })

    it('should go to rentals page', () => {
        // browser.url('https://realtor.com')
        browser.url('')
        const rentalsLink = $('[href="/rentals"]');
        rentalsLink.click(); // Click on the link
        const title = browser.getTitle(); // Get the tittle for the new page.
        expect(title).toEqual('Apartments for Rent, Condos and Home Rentals | Rental Home Property Search | realtor.com®');
    });

})

