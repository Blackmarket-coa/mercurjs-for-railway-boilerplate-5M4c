(async () => {
  const backend = process.env.BACKEND_URL
  if (!backend) {
    console.error('Usage: BACKEND_URL=https://... node validate_plain.js')
    process.exit(1)
  }
  const base = backend.replace(/\/$/, '')
  const timestamp = Date.now()
  const email = `test+plain${timestamp}@example.com`
  const password = `TestPass!${timestamp}`
  const name = `Test Seller ${timestamp}`

  console.log('POST', base + '/auth/register')
  try {
    const res = await fetch(base + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'seller',
        method: 'emailpass',
        email,
        password,
        vendor_type: 'producer'
      })
    })
    console.log('/auth/register status', res.status)
    console.log(await res.text())
  } catch (err) {
    console.error('Error calling /auth/register:', err)
  }

  console.log('\nPOST', base + '/vendor/sellers')
  try {
    const seller = { name, vendor_type: 'producer', member: { name, email } }
    const res2 = await fetch(base + '/vendor/sellers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seller),
    })
    console.log('/vendor/sellers status', res2.status)
    console.log(await res2.text())
  } catch (err) {
    console.error('Error calling /vendor/sellers:', err)
  }
})()
