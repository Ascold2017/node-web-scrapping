var tress = require('tress')
var needle = require('needle')
var cheerio = require('cheerio')
var fs = require('fs')

var URL = 'https://tproger.ru/news/'
var results = []

let currPage = 1

// TODO:
// Save current page number to data.json

var q = tress((url, callback) => {
    needle.get(url, (err, res) => {
        if (err) throw err;
        
        // парсим DOM
        var $ = cheerio.load(res.body)
        console.log(url, $('article.type-post').length)

        let currDate = ''
        const months = [
            'января',
            'февраля',
            'марта',
            'апреля',
            'мая',
            'июня',
            'июля',
            'августа',
            'сентября',
            'октября',
            'ноября',
            'декабря'
        ]

        $('article.type-post').each((index, post) => {
            const postDate = $(post).prev('.date-delimeter').text()
            if (postDate) {
                if (postDate === 'Вчера') {
                    currDate = `${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}`
                } else {
                    currDate = `${Number(postDate.replace(/\D+/g,""))}-${months.findIndex(m => postDate.includes(m)) + 1}-${new Date().getFullYear()}`
                }
            }
            
            const title = $(post).find('h2').text()
            results.push({
                index: results.length,
                title,
                href: $(post).find('a').attr('href'),
                date: currDate
            })
        })

        //паджинатор
        $('.pagination>a').each((i, link) => {
            // не забываем привести относительный адрес ссылки к абсолютному
            if (+$(link).text() === currPage + 1) {
                currPage++
                q.push($(link).attr('href'))
            }
        })

        callback()
    })
}, 100) // запускаем 100 параллельных задач


q.drain = function(){
    if (q.finished) {
        console.log('Total posts: ', results.length)
        fs.writeFileSync('./data.json', JSON.stringify(results, null, 4))
        // TODO export to exel
    } else {
        // TODO - save data every drain (append data to json)
    }
}

q.push(URL)
