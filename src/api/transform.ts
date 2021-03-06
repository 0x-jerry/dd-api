import { Router } from 'oak'
import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
  TargetLanguage,
} from 'https://cdn.skypack.dev/quicktype-core@v6.0.71?dts'

export const router = new Router()

router.post('/json', async (ctx) => {
  const body = ctx.request.body()

  const data =
    body.type === 'text' ? JSON.parse(await body.value) : await body.value

  const { json, lang, name = 'root' } = JSON.parse(data)

  const result = await quicktypeJSON(lang, name, json)

  ctx.response.body = result
})

router.get('/json', async (ctx) => {
  const params = ctx.request.url.searchParams
  const lang = params.get('lang')!
  const json = params.get('json')!
  const name = params.get('name') || 'root'

  const result = await quicktypeJSON(lang, name, json)

  ctx.response.body = result
})

async function quicktypeJSON(
  targetLanguage: string | TargetLanguage,
  typeName: string,
  jsonString: string
) {
  const jsonInput = jsonInputForTargetLanguage(targetLanguage)

  // We could add multiple samples for the same desired
  // type, or many sources for other types. Here we're
  // just making one type from one piece of sample JSON.
  await jsonInput.addSource({
    name: typeName,
    samples: [jsonString],
  })

  const inputData = new InputData()
  inputData.addInput(jsonInput)

  const option: any = {
    // typescript
    'just-types': true,
    'runtime-typecheck': false,
    // rust
    visibility: 'public',
    'derive-debug': true,
  }

  const result = await quicktype({
    inputData,
    lang: targetLanguage,
    rendererOptions: option,
  })

  return result.lines.join('\n')
}
