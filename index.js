const jose = require('jose')

async function computePostureScores(devices) {
  const evaluations = await evaluateDevices(devices)
  return evaluations
}

/**
 * Where the business logic of this custom provider check happens
 * In this simple prototype, the devices with serial numbers set in wrangler.toml will have a score of 100.
 * Otherwise, the score is 0.
 */
async function evaluateDevices(devices) {
  
  // log of all device information received by the worker
  //console.log(devices)

  let evaluations = {}
  devices.forEach(device => {
    evaluations[device.device_id] =  {s2s_id: "serial number: "+device.serial_number+" /hostname: "+device.hostname+" /user: "+device.email, score: 0}
  
    // compare each device received by the worker with the serial numbers that should pass the posture check
    for (const key in POSTURE_PASS) {
      if (POSTURE_PASS[key] === device.serial_number){
        evaluations[device.device_id] =  {s2s_id: "serial number: "+device.serial_number+" /hostname: "+device.hostname+" /user: "+device.email, score: 100}
        //console.log("Found match! serial number: "+device.serial_number+" /hostname: "+device.hostname+" /user: "+device.email)
      }
    }
  })

  // log the responses
  //console.log(evaluations)

  return evaluations
}

// EVERYTHING PAST THIS SHOULD NOT NEED TO CHANGE UNLESS YOU WANT TO
// ==================================================================

addEventListener('fetch', event => {
  event.respondWith(handleExternalDevicePostureRequest(event))
})

/**
 * Top level handler for requests to this worker.
 * Requests for custom device posture integrations will come from Cloudflare.
 * Each request must contain a `Cf-Access-Jwt-Assertion` header.
 */
async function handleExternalDevicePostureRequest(event) {
  try {
    const token = event.request.headers.get('Cf-Access-Jwt-Assertion')

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'missing required cf authorization token' }),
        {
          status: 403,
          headers: { 'content-type': 'application/json' },
        },
      )
    }

    const jwks = jose.createRemoteJWKSet(new URL(`https://${TEAM_DOMAIN}/cdn-cgi/access/certs`))
    try {
      await jose.jwtVerify(token, jwks, {
        audience: `${POLICY_AUD}`
      })
    } catch (e){
      console.error(e)
      return new Response(
        JSON.stringify({ success: false, error: e.toString()}),
        {
          status: 403,
          headers: { 'content-type': 'application/json' },
        },
      )
    }

    const body = await event.request.json()

    resultBody = await computePostureScores(body.devices)

    return new Response(JSON.stringify({ result: resultBody }), {
      headers: { 'content-type': 'application/json' },
    })
  } catch (e) {
    console.error(e)
    return new Response(
      JSON.stringify({ success: false, error: e.toString()}),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      },
    )
  }
}
