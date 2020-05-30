const URLS = require('../../utils/constants/urls');
const timeout = browser.config.waitforTimeout;
const logger = require('@wdio/logger').default;

export default class BasePage {
  constructor() {
    this.title = 'My Page';

    // These browser variables are set based on the UserAgent and can be
    // retrieved in the tests to perform platform-specific actions. It
    // replaces the (mobile-hardware-generated) 'browser.isMobile' variable,
    // which will show as 'false' on emulated mobile browsers.
    browser.rdcMobile = false;
    browser.rdcAndroid = false;
    browser.rdcIphone = false;

    browser
      .execute(() => window.navigator.userAgent)
      .then((res) => {
        browser.userAgent = res;
        if (res.includes('Android')) {
          browser.rdcMobile = true;
          browser.rdcAndroid = true;
          browser.rdcIphone = false;
        }
        if (res.includes('iPhone')) {
          browser.rdcMobile = true;
          browser.rdcAndroid = false;
          browser.rdcIphone = true;
        }
      });
  }

  open(path) {
    browser.url(path);
    browser.waitUntilPageLoads();
  }

  openSRPLandingPageWithSlug(slug, checkError = true, retry = false) {
    let noError = true;
    this.open(`/${URLS.SRP_LANDING_PAGE}/${slug}`);

    if (checkError) {
      noError = retry ? this.refreshPageIfErrorExists('** E2E Tests Info - Load SRP URL ** ') : this.checkErrorsOnPage(false);

      const url = browser.getUrl();
      expect(noError, `[ERROR]: System error (504 or 404) is shown when open url [${url}]`).to.equal(true);
    }

    return noError;
  }

  refreshPageIfErrorExists(message = '** E2E Tests Info **') {
    let noError = this.checkErrorsOnPage(false);
    if (!noError) {
      const url = browser.getUrl();
      var log = logger(message);
      log.info(`[WARNING]: Saw system error on [${url}]; Re-load the page one more time ...`);
      browser.refresh();
      browser.waitUntilPageLoads();
      browser.pause(2000);
      noError = this.checkErrorsOnPage();
    }
    return noError;
  }

  elementShouldExist(element, elementName, message = '') {
    const errorMessage = message
      ? `[${elementName}] does not exist within ${timeout} ms`
      : `[${elementName}] does not exist within ${timeout} ms. Info: ${message}`;
    element.waitForExist(timeout, false, errorMessage);
  }

  clickButton(button, buttonName, waitforElement = null, waitElementName = '', needToScroll = false) {
    button.waitForDisplayed(timeout, false, `[${buttonName}] is NOT displayed within ${timeout} ms`);
    button.waitForEnabled(timeout, false, `[${buttonName}] is NOT enabled within ${timeout} ms`);

    if (needToScroll) {
      button.scrollIntoView({ block: 'center' });
    }

    button.click();
    browser.waitUntilPageLoads();
    if (waitforElement != null) {
      waitforElement.waitForDisplayed(timeout, false, `[${waitElementName}] is not displayed within ${timeout} ms`);
    }
  }

  checkErrorsOnPage(hardFail = true, whenInfo = '') {
    let noError = true;
    // 'Cannot POST /property-suggestions' often occurs, causing test to fail.
    // Add this check in after bug is fixed: https://jira.move.com/browse/LDPX-92
    const possibleErrorMsgs = [
      '504 Gateway Time-out',
      'DNS error',
      'Bad Gateway',
      'It appears we came up empty',
      'This one needs some work',
      'server error',
      'Your connection was interrupted',
      "This site can't be reached",
    ];
    possibleErrorMsgs.forEach((errorMsg) => {
      const errorElement = $(`//*[contains(text(), "${errorMsg}")]`);
      if (errorElement) {
        if (errorElement.isExisting()) {
          noError = false;
        }
        if (hardFail) {
          expect(errorElement.isExisting(), `System error of [${errorMsg}] is shown on [${browser.getUrl()}], ${whenInfo}`).to.equal(false);
        }
      }
    });
    return noError;
  }
}