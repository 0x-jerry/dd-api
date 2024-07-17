import { app } from './_app.ts'
import { get } from './_utils.ts'
import { parse } from '@libs/xml'
import { Feed } from 'feed'

const RSS = 'https://www.jiqizhixin.com/rss'

app.get('/rss/jiqizhixin.com', async (ctx) => {
  const content = await get(RSS)

  const xml = parse(content) as unknown as RSSResponse

  const channel = xml.rss.channel

  const feed = new Feed({
    id: channel.link,
    title: channel.title,
    language: channel.language,
    copyright: channel.title,
    link: channel.link,
    description: channel.description,
  })

  for (const item of channel.item) {
    feed.addItem({
      author: [{ name: item.author }],
      date: new Date(item.pubDate),
      link: item.link,
      title: item.title,
      guid: item.guid,
      description: item.description.slice('<![CDATA['.length, -']]>'.length),
      content: item['content:encoded'].slice('<![CDATA['.length, -']]>'.length),
    })
  }

  const rss = feed.rss2()
  return ctx.body(rss)
})

// ----------- types
interface RSSResponse {
  rss: RSS
}

interface RSS {
  channel: Channel
}

interface Channel {
  title: string
  link: string
  description: string
  language: string
  image: Image
  item: Item[]
}

interface Image {
  url: string
  title: string
  link: string
}

interface Item {
  title: string
  description: string
  author: string
  pubDate: string
  link: string
  guid: string
  source: string
  'content:encoded': string
}