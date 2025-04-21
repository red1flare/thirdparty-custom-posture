# Custom Device Posture Example

This example is based on the sample worker code available at [this github repository](https://github.com/cloudflare/custom-device-posture-integration-example-worker). Cloudflare documnentation about custom device posture integrations can be found in the [Cloudflare developer docs](https://developers.cloudflare.com/cloudflare-one/identity/devices/service-providers/).

In this example, the worker will set a posture check value of 0 for all devices except the one defined in the wrangler.toml file.
The wrangler.toml file should also be updated with the correct access policy AUD, the correct team name and a custom domain for the worker.

Finally, it requires doing "npm install" before deploy the worker with wranger.