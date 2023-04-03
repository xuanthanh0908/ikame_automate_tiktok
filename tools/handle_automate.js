const { Builder, Browser, By, Key, until } = require("selenium-webdriver");
const axios = require("axios");
const events = require("events");
const firefox = require("selenium-webdriver/firefox");
const webdriver = require("selenium-webdriver");
const ApiError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");
const { emitEvent } = require("../utils/socket");
const readline = require("readline");
const fs = require("fs");
const backend_campaign_url = "https://api.ikamegroup.com/api/v1";
const url = {
  CAMPAIGN: "/campaign",
};

// const profile =
//   "C:\\Users\\hd131\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\9azfairu.default-release";

// wait for driver hover hidden parent element
const mouseHoverElement = (el, driver) => {
  driver.executeScript(
    "arguments[0].dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));",
    el
  );
};

// handle choose input
const handleChooseLocation = async (
  driver,
  inputArr,
  inputSearchPath,
  inactivatePath
) => {
  const maxTime = 30000;
  for (const data of inputArr) {
    await driver.findElement(By.xpath(inputSearchPath)).sendKeys(data);
    // wait for loading data to be active
    const selectPath = "//span[contains(text(),'" + data + "')]";
    const condition_select = until.elementLocated({
      xpath: selectPath,
    });
    await driver.wait(condition_select, maxTime).then(async (e) => {
      const select = await driver.findElement(By.xpath(selectPath));
      await driver.executeScript("arguments[0].click();", select);
      // wait for clear input search
      clearInput(driver, inputSearchPath);
      driver.sleep(1000);
    });
  }

  await driver.findElement(By.xpath(inactivatePath)).click();
};
const handleChooseLanguage = async (driver, inputArr, inactivatePath) => {
  const maxTime = 30000;
  for (const data of inputArr) {
    // wait for loading data to be active
    const selectPath =
      "//div[@class='vi-tree-node__content']//span[contains(text(),'" +
      data +
      "')]";
    const condition_select = until.elementLocated({
      xpath: selectPath,
    });
    await driver.wait(condition_select, maxTime).then(async (e) => {
      const select = await driver.findElement(By.xpath(selectPath));
      await driver.executeScript("arguments[0].click();", select);
      // wait for clear input search
      driver.sleep(1000);
    });
  }

  await driver.findElement(By.xpath(inactivatePath)).click();
};
const handleVideos = async (driver, inputArr) => {
  const maxTime = 20000;
  const buttonImportPath =
    "//button[@class='vi-button vi-byted-button vi-button--default']//span[contains(text(),'From library')]";
  const inputSearchVideoPath = "//input[@placeholder='Search by name or ID']";
  const iconSearchVideoPath = "(//i[@class='vi-icon2-search'])[1]";
  const firstVideoPath = "(//div[@class='slip-content_loadingMask_idBtk'])[1]";

  const buttonImport = await driver.findElement(By.xpath(buttonImportPath));
  await driver.executeScript("arguments[0].click();", buttonImport);
  driver.sleep(1000);
  // wait for loading data to be active
  const condition_select = until.elementLocated({
    xpath: firstVideoPath,
  });
  await driver.wait(condition_select, maxTime).then(async (e) => {
    // scroll to button import
    for (const [index, data] of inputArr.entries()) {
      await driver.findElement(By.xpath(inputSearchVideoPath)).sendKeys(data);
      await driver
        .findElement(By.xpath(iconSearchVideoPath))
        .click()
        .then(async () => {
          // handle wait for loading video
          const condition_video = until.elementLocated({
            xpath: firstVideoPath,
          });
          await driver.wait(condition_video, maxTime).then(async (e) => {
            const element = await driver.findElement(By.xpath(firstVideoPath));
            await driver.executeScript("arguments[0].click();", element);
            clearInput(driver, inputSearchVideoPath);
            driver.sleep(3000);
          });
        });
    }
  });

  const confirmButtonPath =
    "//button[@data-testid='creative_detail_libraryConfirm']//span[contains(text(),'Confirm')]";
  await driver.findElement(By.xpath(confirmButtonPath)).click();
};
const handleAddText = async (driver, inputArr, checked) => {
  const addButtonPath =
    "//button[@class='vi-button vi-byted-button vi-button--default']//span//span[contains(text(),'Add')]";
  for (const [index, data] of inputArr.entries()) {
    const textPath =
      "(//textarea[@placeholder='Enter text for your ad'])[" +
      (index + 1) +
      "]";
    const findAddButton = await driver.findElement(By.xpath(addButtonPath));
    // const findText = await driver.findElement(By.xpath(textPath));
    await driver.findElement(By.xpath(textPath)).sendKeys(data);
    await driver.executeScript("arguments[0].click();", findAddButton);
    driver.sleep(1000);
  }
  checked = true;
};
// wait for targeting to be active
const handleWaitToTargeting = async (driver, data) => {
  const xpathCheck = "//label[normalize-space()='Location']";
  const maxTime = 30000;
  const condition = until.elementsLocated({
    xpath: xpathCheck,
  });
  await driver.wait(condition, maxTime).then(async function () {
    // await driver.findElement(By.className("vi-icon2-edit")).click();
    // Find the element that causes the hidden element to appear
    const triggerElement = await driver.findElement(By.xpath(xpathCheck));
    // handle select app
    // const selectAppPath = "//input[@placeholder='Select app']";
    // const condition_select_app = until.elementLocated({
    //   xpath: selectAppPath,
    // });
    // await driver.wait(condition_select_app, maxTime).then(async (e) => {
    //   await driver.findElement(By.xpath(selectAppPath)).click();

    //   const app_name_paths = "//div[@class='item-text item-name']";
    //   const condition_ = until.elementLocated({
    //     xpath: app_name_paths,
    //   });
    //   await driver.wait(condition_, maxTime).then(async (e) => {
    //     const element = await driver.findElement(By.xpath(app_name_paths));
    //     const name_app = "Cast for Chromecast & TV Cast";
    //     if (element.length > 0) {
    //       for (const el of element.entries()) {
    //         const text = await el.getText();
    //         if (text === name_app) {
    //           el.click();
    //         }
    //       }
    //     } else {
    //       const text = await element.getText();
    //       if (text === name_app) {
    //         element.click();
    //       }
    //     }
    //     const blurPath =
    //       "//span[normalize-space()='Where would you like to show your ads?']";
    //     await driver.executeScript("arguments[0].click();", findApp);
    //     await driver.findElement(By.xpath(blurPath)).click();
    //   });
    // });
    // Move the mouse over the trigger element to make the hidden element visible
    driver
      .actions()
      .move({ origin: triggerElement })
      .perform()
      .then(async function () {
        mouseHoverElement(triggerElement, driver);
        const hiddenElementXpath =
          "//button[@class='vi-button vi-byted-button vi-button--text index_spcLocationEditBtn_Y2bQH']//span[contains(text(),'Edit')]";
        await driver
          .wait(
            until.elementsLocated({
              xpath: hiddenElementXpath,
            }),
            maxTime
          )
          .then(async function () {
            const findHiddenElement = await driver.findElement(
              By.xpath(hiddenElementXpath)
            );
            await driver.executeScript(
              "arguments[0].click();",
              findHiddenElement
            );
            const inputPath =
              "//div[@class='vi-select-tree index_locationFormItem_dP0yb']//div//div[@class='vi-select-tree-inside-container']";
            const findInputEl = await driver.findElement(By.xpath(inputPath));
            await driver
              .executeScript(
                "arguments[0].dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));",
                findInputEl
              )
              .then(async function () {
                const x_close_path =
                  "//i[@class='right-icon vi-icon-circle-close']";
                const condition_close = until.elementLocated({
                  xpath: x_close_path,
                });
                await driver.wait(condition_close, maxTime).then(async (e) => {
                  await driver.findElement(By.xpath(x_close_path)).click();
                  driver.executeScript("arguments[0].click();", findInputEl);

                  // wait for input search
                  const inputSearchPath = "//input[@placeholder='Search']";
                  //  wait for input search to be active
                  const condition = until.elementLocated({
                    xpath: inputSearchPath,
                  });
                  await driver.wait(condition, maxTime).then(async function () {
                    const inactivatePath =
                      "//span[normalize-space()='Who should see your ads?']";
                    await handleChooseLocation(
                      driver,
                      data.locations,
                      inputSearchPath,
                      inactivatePath
                    );

                    // handle mouse hover language input
                    // const languageInputPath =
                    //   "//label[normalize-space()='Languages']"
                    // const findLanguageInputEl = await driver.findElement(
                    //   By.xpath(languageInputPath),
                    // )
                    // driver
                    //   .actions()
                    //   .move({ origin: findLanguageInputEl })
                    //   .perform()
                    //   .then(async function () {
                    // mouseHoverElement(findLanguageInputEl, driver)
                    // const hiddenElementXpath =
                    //   '/html[1]/body[1]/div[3]/div[1]/div[1]/div[2]/div[1]/div[1]/div[2]/div[1]/div[1]/div[1]/form[1]/div[2]/div[1]/section[2]/div[2]/div[1]/div[1]/div[2]/div[1]/div[1]/button[1]/span[1]'
                    // await driver
                    //   .wait(
                    //     until.elementsLocated({
                    //       xpath: hiddenElementXpath,
                    //     }),
                    //     maxTime,
                    //   )
                    // .then(async function () {
                    //   await driver
                    //     .findElement(By.xpath(hiddenElementXpath))
                    //     .click()
                    //   const inputLanguagePath =
                    //     "//div[@class='vi-select-tree']//div//div[@class='vi-select-tree-inside-container']"
                    //   await driver
                    //     .findElement(By.xpath(inputLanguagePath))
                    //     .click()
                    // await handleChooseLanguage(
                    //   driver,
                    //   data.languages,
                    //   inactivatePath
                    // );
                    // handle change budget input
                    const budgetInputPath =
                      "//input[@data-tea='create_adgroup_budget_num']";
                    clearInput(driver, budgetInputPath);
                    driver.sleep(1000);
                    await driver
                      .findElement(By.xpath(budgetInputPath))
                      .sendKeys(data.budget);
                  });
                  // handle select start date
                  const startDatePath = "//input[@placeholder='Start date']";
                  const selectDatePath = "//input[@placeholder='Select date']";
                  const selectTimePath = "//input[@placeholder='Select time']";
                  // enable input start date
                  await driver.findElement(By.xpath(startDatePath)).click();
                  driver.sleep(1000);
                  // clear select date input
                  clearInput(driver, selectDatePath);
                  await driver
                    .findElement(By.xpath(selectDatePath))
                    .sendKeys(data.startDate.date);
                  driver.sleep(1000);
                  // clear select time input
                  clearInput(driver, selectTimePath);
                  await driver
                    .findElement(By.xpath(selectTimePath))
                    .sendKeys(data.startDate.time);

                  // inactivate input end date
                  const inactivateSelectPath =
                    "//span[@class='budget-schedule-title']";
                  const inaac = await driver.findElement(
                    By.xpath(inactivateSelectPath)
                  );
                  await driver.executeScript("arguments[0].click();", inaac);
                  // handle select video
                  await handleVideos(driver, data.videos);
                  // scroll to end page
                  // find the <body> element

                  const buttonElPath =
                    "//div[@class='index_title_gRuIn']//span[contains(text(),'Tracking')]";
                  const el = driver.findElement(By.xpath(buttonElPath));
                  // scroll to the bottom of the page
                  driver
                    .executeScript("arguments[0].scrollIntoView(true)", el)
                    .then(async function () {
                      // handle add text
                      await handleAddText(driver, data.texts, checked);
                    });
                  // })
                });
              });
          });
      });
  });
};

// wait for switch status to be active
const waitSwitchStatus = async (driver, data) => {
  // await driver until.elementLocated find element success
  const xpath =
    "//div[@data-tea='create_campaign_spc_status']//div[@role='switch']";
  const condition = until.elementLocated({
    xpath: xpath,
  });
  const maxTime = 30000;
  driver.wait(condition, maxTime).then(async function () {
    await driver
      .findElement(
        By.xpath(
          "//div[@data-tea='create_campaign_spc_status']//div[@role='switch']"
        )
      )
      .click();
    clearInput(driver, "//input[@type='text']");
    await driver
      .findElement(By.xpath("//input[@type='text']"))
      .sendKeys(data.campaign_name);

    // handle click button continue
    await driver
      .findElement(By.xpath("//button[@data-testid='common_next_button']"))
      .click();
    await driver.sleep(5000).then(async function () {
      await handleWaitToTargeting(driver, data);
    });
  });
};
// clear input
const clearInput = async (driver, xpath) => {
  await driver.findElement(By.xpath(xpath)).sendKeys(Key.CONTROL, "a");
  await driver.findElement(By.xpath(xpath)).sendKeys(Key.DELETE);
};
const runTest = catchAsync(async (req, res, next) => {
  let profile = [];
  const appDataPath = process.env.APPDATA + "\\Mozilla\\Firefox\\profiles.ini"; // Get the path to the AppData folder
  const readInterface = readline.createInterface({
    input: fs.createReadStream(appDataPath),
    output: process.stdout,
    console: false,
  });
  readInterface.on("line", function (line) {
    profile.push(line);
  });

  /// wait for readInterface to close
  events.once(readInterface, "close").then(async (e) => {
    const profilePath =
      process.env.APPDATA + "\\Mozilla\\Firefox\\" + profile[1].split("=")[1];
    const data = req.data;
    // console.log("data", data);
    const { id, userId } = req.body;
    let options = new firefox.Options();
    options.setProfile(profilePath);
    let checked = false;

    //To wait for browser to build and launch properly
    let driver = await new webdriver.Builder()
      .forBrowser("firefox")
      .setFirefoxOptions(options)
      .build();
    try {
      await driver.get(data.campaign_url);
      await driver.sleep(1000);
      let maxTime = 30000;
      var xpath = "//div[normalize-space()='App promotion']";
      var condition = until.elementLocated({
        xpath: xpath,
      });
      await driver.wait(condition, maxTime).then(async function () {
        await driver
          .findElement(By.xpath("//div[normalize-space()='App promotion']"))
          .click();

        await waitSwitchStatus(driver, data);
      });
    } finally {
      const startOverPath =
        "//button[@data-tea-click='draft_confirmation_start_over']";
      const findButton = await driver
        .findElement(By.xpath(startOverPath))
        .isDisplayed();
      if (findButton) {
        await driver.findElement(By.xpath(startOverPath)).click();
        runTest(req, res, next);
        await driver.quit();
      }
      if (checked) {
        // handle success status
        await axios.patch(backend_campaign_url + url.CAMPAIGN + "/" + id, {
          status: "completed",
        });
        console.log("RUN TEST SUCCESS");
        emitEvent("message", {
          message: "Run test success",
          type: "success",
          userId,
        });
      } else {
        // console.log("SOME THING WENT WRONG: ", err);
        await axios.patch(backend_campaign_url + url.CAMPAIGN + "/" + id, {
          status: "canceled",
        });
        console.log("RUN TEST FAILED");
        emitEvent("message", {
          message: "Run test failed",
          type: "success",
          userId,
        });
      }
    }
  });
});

const handleFetchApi = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  try {
    const response = await axios.get(
      backend_campaign_url + url.CAMPAIGN + "/" + id
    );
    if (response.status === 200) {
      const origin_data = response.data.data;
      // console.log("origin_data", origin_data);
      const formattedDate = new Date(origin_data.start_date)
        .toISOString()
        .slice(0, 10);
      const campaign_data = {
        campaign_url: origin_data.campaign_url,
        campaign_name: origin_data.campaign_name,
        app_name: origin_data.product,
        locations: origin_data.locations,
        languages: origin_data.languages,
        budget: origin_data.budget,
        startDate: {
          date: formattedDate,
          time: "00:00",
        },
        videos: origin_data.videos,
        texts: origin_data.texts.flat(1),
        profile: origin_data.profile,
      };
      req.data = campaign_data;
      if (origin_data.status === "pending" || origin_data.status === "canceled")
        runTest(req, res, next);
    } else throw new ApiError(400, "BAD REQUEST");
  } catch (error) {
    throw new ApiError(400, "BAD REQUEST");
  }
});
// handleFetchApi("641bd665a3a4a9f7f4cf4ee6");
module.exports = {
  handleFetchApi,
};
