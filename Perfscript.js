const fs = require('fs')
const puppeteer = require('puppeteer')
const lighthouse = require('lighthouse/lighthouse-core/fraggle-rock/api.js')

const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while(checkCounts++ <= maxChecks){
    let html = await page.content();
    let currentHTMLSize = html.length; 

    let bodyHTMLSize = await page.evaluate(() => document && document.body && document.body.innerHTML.length || 0);

    //console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

    if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
      countStableSizeIterations++;
    else 
      countStableSizeIterations = 0; //reset the counter

    if(countStableSizeIterations >= minStableSizeIterations) {
      console.log("Fully Rendered Page: " + page.url());
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitForTimeout(checkDurationMsecs);
  }  
};

async function captureReport() {
	//const browser = await puppeteer.launch({args: ['--allow-no-sandbox-job', '--allow-sandbox-debugging', '--no-sandbox', '--disable-gpu', '--disable-gpu-sandbox', '--display', '--ignore-certificate-errors', '--disable-storage-reset=true']});
	const browser = await puppeteer.launch({"headless": false, args: ['--allow-no-sandbox-job', '--allow-sandbox-debugging', '--no-sandbox', '--ignore-certificate-errors', '--disable-storage-reset=true']});
	const page = await browser.newPage();
	const baseURL = "http://localhost/";
	
	await page.setViewport({"width":1920,"height":1080});
	await page.setDefaultTimeout(10000);
	
	const navigationPromise = page.waitForNavigation({timeout: 30000, waitUntil: ['domcontentloaded']});
	await page.goto(baseURL);
    await navigationPromise;
		
	const flow = await lighthouse.startFlow(page, {
		name: 'performancetask',
		configContext: {
		  settingsOverrides: {
			throttling: {
			  rttMs: 40,
			  throughputKbps: 10240,
			  cpuSlowdownMultiplier: 1,
			  requestLatencyMs: 0,
			  downloadThroughputKbps: 0,
			  uploadThroughputKbps: 0
			},
			throttlingMethod: "simulate",
			screenEmulation: {
			  mobile: false,
			  width: 1920,
			  height: 1080,
			  deviceScaleFactor: 1,
			  disabled: false,
			},
			formFactor: "desktop",
			onlyCategories: ['performance'],
		  },
		},
	});

  	//================================NAVIGATE================================
    await flow.navigate(baseURL, {
		stepName: 'open main page'
		});
  	console.log('main page is opened');
	
	const FullNameValue	  = "Ben";
	const AddressValue    = "Hataevicha 3";
	const PostalCodeValue = "246000";
	const CityValue   	  = "Gomel";
	const CountryValue    = "BY";
	const PhoneValue  	  = "123456789";
	const EmailValue   	  = "123587@gmail.com"
	
	//================================SELECTORS================================
	const TablesTab      = ".page-item-13 a";
	const Table      	 = ".product-121";
	const AddToCard      = ".add-to-shopping-cart button[type='submit']";
	const Cart      	 = ".page-item-31 a";
	const PlaceOrder     = "input.to_cart_submit";
	const FullName     	 = "input[name='cart_name']";
	const Address     	 = "input[name='cart_address']";
	const PostalCode     = "input[name='cart_postal']";
	const City    		 = "input[name='cart_city']";
	const Country    	 = "select[name='cart_country']";
	const Phone    	 	 = "input[name='cart_phone']";
	const Email    	 	 = "input[name='cart_email']";
	const CartSubmit     = "input[name='cart_submit']";
	const ThankYouPage   = "#post-33";
	
	
	//================================PAGE_ACTIONS================================
	await flow.startTimespan({ stepName: 'TablesTab' });
		await page.waitForSelector(TablesTab);
		await page.click(TablesTab);
		await navigationPromise;
    await flow.endTimespan();
    console.log('TablesTab is completed');
	
	await flow.startTimespan({ stepName: 'Table' });
		await page.waitForSelector(Table);
		await page.click(Table);
		await navigationPromise;
    await flow.endTimespan();
    console.log('Table is completed');
	
	await flow.startTimespan({ stepName: 'AddToCard' });
		await page.waitForSelector(AddToCard);
		await page.click(AddToCard);
		await navigationPromise;
    await flow.endTimespan();
    console.log('AddToCard is completed');
	
	await flow.startTimespan({ stepName: 'Cart' });
		await page.waitForSelector(Cart);
		await page.click(Cart);
		await navigationPromise;
    await flow.endTimespan();
    console.log('Cart is completed');
	
	await flow.startTimespan({ stepName: 'PlaceOrder' });
		await page.waitForSelector(PlaceOrder);
		await page.click(PlaceOrder);
		await navigationPromise;
    await flow.endTimespan();
    console.log('PlaceOrder is completed');
	
	await flow.startTimespan({ stepName: 'Checkout' });
		await waitTillHTMLRendered(page);
		await page.waitForSelector(FullName);
		await page.type(FullName, FullNameValue);
		await page.waitForSelector(Address);
		await page.type(Address, AddressValue);
		await page.waitForSelector(PostalCode);
		await page.type(PostalCode, PostalCodeValue);
		await page.waitForSelector(City);
		await page.type(City, CityValue);
		await page.waitForSelector(Country);
		await page.select(Country, CountryValue);
		await page.waitForSelector(Phone);
		await page.type(Phone, PhoneValue);
		await page.waitForSelector(Email);
		await page.type(Email, EmailValue);
    await flow.endTimespan();
    console.log('Checkout is completed');
		
	await flow.startTimespan({ stepName: 'CartSubmit' });
		await page.waitForSelector(CartSubmit);
		await page.click(CartSubmit);
		await waitTillHTMLRendered(page);
		await page.waitForSelector(ThankYouPage);
    await flow.endTimespan();
    console.log('CartSubmit is completed');

	//================================REPORTING================================
	const reportPath = __dirname + '/user-flow.report.html';
	//const reportPathJson = __dirname + '/user-flow.report.json';

	const report = await flow.generateReport();
	//const reportJson = JSON.stringify(flow.getFlowResult()).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
	
	fs.writeFileSync(reportPath, report);
	//fs.writeFileSync(reportPathJson, reportJson);
	
    await browser.close();
}
captureReport();