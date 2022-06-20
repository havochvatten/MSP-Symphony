import { AppPage } from './app.po';
import { browser, element, by, Key, $ } from 'protractor';

function setUp() {
  const page = new AppPage();
  return { page };
}

describe('workspace-project App', () => {
  it('should display welcome message', () => {
    const { page } = setUp();
    page.navigateTo();
    expect(page.getTitleText()).toEqual('SYMPHONY');
  });

  /* afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser
      .manage()
      .logs()
      .get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE
      } as logging.Entry)
    );
  }); */
});

describe('Login', () => {
  it('should not log in', () => {
    const { page } = setUp();
    page.navigateTo()
    element(by.css('input')).sendKeys('sympho1');
    element(by.css('input[type="password"]')).sendKeys('sym123', Key.ENTER);
    browser.driver.sleep(100);
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + 'login');
    expect(element(by.css('.error')).isDisplayed()).toBe(true);
  })

  it('should log in', () => {
    const { page } = setUp();
    page.navigateTo()
    element(by.css('input')).sendKeys('sympho1');
    element(by.css('input[type="password"]')).sendKeys('sym123!', Key.ENTER);
    browser.driver.sleep(100);
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + 'map');
  })

  it('should log out', () => {
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + 'map');
    $('app-user-menu-toggle').click();
    browser.driver.sleep(100);
    element(by.css('a[href="/map"]')).click();
    browser.driver.sleep(100);
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + 'login');
  })
})
