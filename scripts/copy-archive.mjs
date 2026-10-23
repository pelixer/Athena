// 아트 아카이브 데이터(정적 파일 묶음)를 public/archive/<판>/에 푼다. 서버 없이 앱이 필요한 조각만 받아 읽는다.
// npm run dev / build 전에 자동으로 실행된다 (package.json의 predev, prebuild).
// 데이터는 레포에 두지 않고 GitHub 릴리스(archive-data 워크플로가 만든다)에서 받아 해시를 확인한다 — OCR 모델과 같은 방식.
// 어떤 판을 쓸지는 archive.lock.json이 정한다. 이 파일이 없으면 아카이브 없이 빌드한다.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const LOCK = 'archive.lock.json'
const REPO = 'https://github.com/pelixer/Athena/releases/download'
const out = 'public/archive'

if (!existsSync(LOCK)) {
  console.warn('archive: archive.lock.json 없음 — 아카이브 없이 빌드합니다')
  process.exit(0)
}
const { tag, asset, sha256: want } = JSON.parse(readFileSync(LOCK, 'utf8'))
const cache = `.cache/archive/${tag}.tar.gz`
const dest = `${out}/${tag}`
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')

if (existsSync(`${dest}/manifest.json`) && existsSync(`${out}/current.json`) && JSON.parse(readFileSync(`${out}/current.json`, 'utf8')).version === tag) {
  process.exit(0)
}

mkdirSync('.cache/archive', { recursive: true })
if (!existsSync(cache) || sha256(readFileSync(cache)) !== want) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(`${REPO}/${tag}/${asset}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (sha256(buf) !== want) throw new Error('해시가 다릅니다')
      writeFileSync(cache, buf)
      break
    } catch (e) {
      if (attempt >= 4) throw new Error(`아카이브 데이터를 받지 못했습니다: ${tag}/${asset} (${e.message})`)
      await new Promise((r) => setTimeout(r, 2000 * 2 ** (attempt - 1)))
    }
  }
}

// 옛 판은 지우고 새 판만 푼다 (배포 파일 수 한도: Cloudflare 무료 20,000개)
rmSync(out, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
execFileSync('tar', ['-xzf', cache, '-C', dest])
writeFileSync(`${out}/current.json`, JSON.stringify({ version: tag }))
console.log(`archive: ${tag} → ${dest}`)
