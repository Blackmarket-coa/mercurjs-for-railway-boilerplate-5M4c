(async () => {
  const backend = process.env.BACKEND_URL
  if (!backend) {
    console.error('Usage: BACKEND_URL=https://... node validate_registration_sdk.js')
    process.exit(1)
  }
  const { default: Medusa } = await import('@medusajs/js-sdk')
  const sdk = new Medusa({ baseUrl: backend })

  const timestamp = Date.now()
  const email = `test+sdk${timestamp}@example.com`
  const password = `TestPass!${timestamp}`
  const name = `Test SDK Seller ${timestamp}`

  console.log('Calling sdk.auth.register')
  try {
    const token = await sdk.auth.register('seller', 'emailpass', { email, password })
    console.log('register returned:', token)
  } catch (err) {
    console.error('sdk.auth.register failed:', err?.message || err)
  }

  // Try POST /vendor/sellers directly
  try {
    const seller = { name, vendor_type: 'producer', member: { name, email } }
    const res = await fetch(`${backend.replace(/\/$/, '')}/vendor/sellers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seller),
    })
    console.log('/vendor/sellers status', res.status)
    console.log(await res.text())
  } catch (err) {
    console.error('POST /vendor/sellers failed:', err)
  }
})()
