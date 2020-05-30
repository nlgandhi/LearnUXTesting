export default class BaseValidator {
    
    validatePageTitle(expectedTitle) {
      browser.waitUntilPageLoads();
      const actualTitle = browser.getTitle();
      expect(actualTitle).to.equal(expectedTitle);
    }
  
    validateUrlContains(expectedUrlParam) {
      browser.waitUntilUrlContains(expectedUrlParam);
      const url = browser.getUrl();
      expect(url.toLowerCase()).to.contain(expectedUrlParam.toLowerCase());
    }
  
    validatePageTitleContains(expectedTitleSubString) {
      browser.waitUntilPageLoads();
      const actualTitle = browser.getTitle();
      expect(actualTitle).to.contain(expectedTitleSubString);
    }
  
    validateUrlStatus(url) {
      const urlStatus = browser.getUrlStatus(url);
      expect(urlStatus).to.equal(200, 'Failed URL: ' + url);
    }
  
    validate404() {
      browser.waitUntilPageLoads();
      const errorPage = $('#error-404');
      return errorPage.isDisplayed();
    }
  }
  
  // export this when you want to use BaseValidator method directly in your *.test.js
  export const BaseValidatorInstance = new BaseValidator();