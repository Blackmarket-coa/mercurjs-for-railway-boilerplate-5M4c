const backend = process.env.BACKEND_URL || process.argv[2]
if (!backend) {
  console.error('Usage: BACKEND_URL=https://... node validate_registration.js')
  process.exit(1)
}

const fetch = globalThis.fetch || require('node-fetch')

async function run() {
  const timestamp = Date.now()
  const email = `test+${timestamp}@example.com`
  const password = `TestPass!${timestamp}`
  const name = `Test Seller ${timestamp}`

  console.log('Registering auth for', email)
  const regRes = await fetch(`${backend.replace(/\/$/, '')}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entity: 'seller', provider: 'emailpass', email, password }),
  })

  const regBody = await regRes.text()
  let regJson
  try { regJson = JSON.parse(regBody) } catch(e) { regJson = { raw: regBody } }
  console.log('Auth register status', regRes.status, regJson)

  if (!regRes.ok) {
    console.error('Auth registration failed; aborting')
    process.exit(2)
  }

  // Some Medusa setups return a token string, others return { token }
  const token = typeof regJson === 'string' ? regJson : regJson?.token || regJson?.access_token || null

  if (!token) {
    console.warn('No token returned from auth.register; continuing may fail')
  }

  console.log('Creating seller request')
  const seller = {
    name,
    vendor_type: 'producer',
    member: {
      name,
      email,
    },
  }

  const sellerRes = await fetch(`${backend.replace(/\/$/, '')}/vendor/sellers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(seller),
  })

  const sellerBody = await sellerRes.text()
  let sellerJson
  try { sellerJson = JSON.parse(sellerBody) } catch(e) { sellerJson = { raw: sellerBody } }
  console.log('Seller create status', sellerRes.status, sellerJson)

  if (!sellerRes.ok) process.exit(3)
  console.log('Validation flow completed successfully')
}

run().catch((err) => {
  console.error('Unexpected error', err)
  process.exit(99)
})
