/**
 * This function will create a map of external device posture by serial number first.
 * Then it will format and set the evaluations for each device matching by serial number.
 * @param {*} devices - devices on a cloudflare account to be evaluated. 
 * @param {*} devicePosture - Device posture checks from the third party service. 
 * @returns 
 */
async function evaluateDevices(devices, devicePosture) {
  const postureMap = new Map()
  devicePosture.forEach(posture => {
    postureMap.set(posture.serial_number, posture)
  })

  let evaluations = {}
  devices.forEach(device => {
    let postureCheck = postureMap.get(device.serial_number)
    if (!postureCheck){
      evaluations[device.device_id] = {s2s_id: "", score: 0}
    }
    else {
      let externalId = postureCheck.id || ""
      let score = postureCheck.risk_score || 0
      evaluations[device.device_id] = {s2s_id: externalId, score: score}
    }
  })

  return evaluations
}

/**
 * Mock device posture checks from an external service endpoint.
 * Replace the fetch to the external service in computePostureScores with this function.
 * @returns
 */
async function mockFetchExternalDevicePosture() {
  let response = '{ "result" : [' +
    '{ "id":"9ece5fab-7398-488a-a575-e25a9a3dec07" , "serial_number":"Rh6EKhyv", "risk_score":0 },' +
    '{ "id":"03eb5401-3072-431e-b1ea-acc1214706cb" , "serial_number":"jdR44P3d", "risk_score":50 },' +
    '{ "id":"0106ba29-0a1b-4df2-aad7-a408cef1f59c" , "serial_number":"CxnzTWjF", "risk_score":100 } ]}';
  const body = JSON.parse(response)
  return body.result
}


/**
 * Example curl that can be used for testing with the mocked device postures above.
 */
/*curl 'http://localhost:8787' \
--header 'Cf-Access-Jwt-Assertion: <jwt>' \
--data-raw '{
   "Devices":[
      {
         "device_id":"dev3",
         "serial_number":"Rh6EKhyv"
      },
      {
         "device_id":"dev1",
         "serial_number":"jdR44P3d"
      },
      {
         "device_id":"dev2",
         "serial_number":"CxnzTWjF"
      },
      {
         "device_id":"dev4",
         "serial_number":"awdawd"
      }
   ]
}'*/