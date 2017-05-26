const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

let json = [];

const URL = process.argv[2]
const OUTPUT_FILE = process.argv[3]

if(!URL || !OUTPUT_FILE){
  console.log('Ошибка! Неправильное использование!\n\tПример: node server.js \'http://www.adidas.com/us/basketball-accessories\' basketball-accessories.json')
  process.exit()
}

let counter = [0,0]

JSDOM.fromURL(URL)
  .then(dom=>{
    const document = dom.window.document;
    let productsLinks = [...document.querySelectorAll('.product-tile')].map(el=>el.querySelector('[data-track]').href);
    const productsPages = productsLinks.map(link=>JSDOM.fromURL(link))
    Promise.all(productsPages).then(pages=>{
      pages.forEach(({ window, window: { document } })=>{
        try {
          json.push({
            title: document.querySelector('.title-32.vmargin8').textContent,
            id: document.querySelector('.product-segment.MainProductSection').getAttribute('id'),
            price: document.querySelector('.sale-price').getAttribute('data-sale-price'),
            currency: "USD",
            urlTo: window.location.href,
            sizes: [...document.querySelector('.size-dropdown-block').querySelectorAll('option')].slice(1).map(el=>el.textContent.trim()),
            description: document.querySelector('.product-segment.ProductDescription ').innerHTML.replace(/\n/g,'').trim(),
            images: [...document.querySelectorAll('[data-zoom]')].reverse().slice(1).map(img=>img.src)
          })
          counter[0]++
        } catch (e) {
          //console.log(window.location.href+' ('+document.querySelector('.product-segment.MainProductSection').getAttribute('id')+') => error')
          counter[1]++
        }
      })
      fs.writeFile(OUTPUT_FILE,JSON.stringify(json,null,2),()=>console.log(`done: success(${counter[0]}), errors(${counter[1]})`))
    })
  })
