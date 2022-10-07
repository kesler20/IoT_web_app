const TOPIC = "data";
const AWSAccessKeyId = "AKIATYSME3DNQEJPAF2I";
const AWSSecretKey = "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";

// the ordert things should be executed https://stackoverflow.com/questions/36080053/amqjs0011e-invalid-state-not-connected
// great documentation https://www.hivemq.com/blog/mqtt-client-library-encyclopedia-paho-js/
// good guide https://www.developer.here.com/blog/using-mqtt-in-javascript-with-aws-iot

// gets MQTTclient
const initClient = () => {
  const clientId = Math.random().toString(36).substring(7);
  const _client = new Paho.MQTT.Client(getEndpoint(), clientId);

  _client.publish = function (topic, payload) {
    let payloadText = JSON.stringify(payload);
    let message = new Paho.MQTT.Message(payloadText);
    message.destinationName = topic;
    message.retained = true;
    message.qos = 0;
    _client.send(message);
  };
  return _client;
};

const getEndpoint = () => {
  // WARNING!!! It is not recommended to expose
  // sensitive credential information in code.
  // Consider setting the following AWS values
  // from a secure source.

  // example: us-east-1
  const REGION = "eu-west-2";

  // example: blahblahblah-ats.iot.your-region.amazonaws.com
  const IOT_ENDPOINT = "a3k87iu5fx1kk4-ats.iot.eu-west-2.amazonaws.com";

  // your AWS access key ID
  const KEY_ID = AWSAccessKeyId;

  // your AWS secret access key
  const SECRET_KEY = AWSSecretKey;

  // date & time
  const dt = new Date().toISOString().replace(/[^0-9]/g, "");
  const ymd = dt.slice(0, 8);
  const fdt = `${ymd}T${dt.slice(8, 14)}Z`;

  const scope = `${ymd}/${REGION}/iotdevicegateway/aws4_request`;
  const ks = encodeURIComponent(`${KEY_ID}/${scope}`);
  let qs = `X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${ks}&X-Amz-Date=${fdt}&X-Amz-SignedHeaders=host`;
  const req = `GET\n/mqtt\n${qs}\nhost:${IOT_ENDPOINT}\n\nhost\n${p4.sha256(
    ""
  )}`;

  qs +=
    "&X-Amz-Signature=" +
    p4.sign(
      p4.getSignatureKey(SECRET_KEY, ymd, REGION, "iotdevicegateway"),
      `AWS4-HMAC-SHA256\n${fdt}\n${scope}\n${p4.sha256(req)}`
    );
  return `wss://${IOT_ENDPOINT}/mqtt?${qs}`;
};

class P4 {
  sign = function (key, msg) {
    const hash = CryptoJS.HmacSHA256(msg, key);
    return hash.toString(CryptoJS.enc.Hex);
  };

  sha256 = function (msg) {
    const hash = CryptoJS.SHA256(msg);
    return hash.toString(CryptoJS.enc.Hex);
  };
  getSignatureKey = function (key, dateStamp, regionName, serviceName) {
    const kDate = CryptoJS.HmacSHA256(dateStamp, "AWS4" + key);
    const kRegion = CryptoJS.HmacSHA256(regionName, kDate);
    const kService = CryptoJS.HmacSHA256(serviceName, kRegion);
    const kSigning = CryptoJS.HmacSHA256("aws4_request", kService);
    return kSigning;
  };
}
const p4 = new P4();

const getClient = (success) => {
  if (!success) success = () => console.log("connected");
  const _client = initClient();
  const connectOptions = {
    useSSL: true,
    timeout: 3,
    mqttVersion: 4,
    onSuccess: success,
  };
  _client.connect(connectOptions);
  return _client;
};

// let client = {};
const init = () => {
  client = getClient();
  client.onMessageArrived = processMessage;
  client.onConnectionLost = function (e) {
    console.log(e);
  };
};

const processMessage = (message) => {
  let info = JSON.parse(message.payloadString);
  const publishData = {
    retailer: retailData,
    order: info.order,
  };
  client.publish(TOPIC, publishData);
};

// Create a client instance: Broker, Port, Websocket Path, Client ID
const clientId = Math.random().toString(36).substring(7);
const client = new Paho.MQTT.Client(getEndpoint(), clientId);

// set callback handlers
client.onConnectionLost = function (responseObject) {
  console.log("Connection Lost: " + responseObject.errorMessage);
};

// Called when the connection is made
function onConnect() {
  console.log("Connected!");
  client.subscribe(TOPIC);
  //   let payload = 'hello'
  //   let payloadText = JSON.stringify(payload);
  //   let message = new Paho.MQTT.Message(payloadText);
  //   message.destinationName = TOPIC;
  //   message.retained = true;
  //   message.qos = 0;
  //   client.send(message);
}

// Connect the client, providing an onConnect callback
client.connect({
  onSuccess: onConnect,
});

var data;

client.onMessageArrived = function (message) {
  data = parseFloat(message.payloadString);
  console.log("Message Arrived: " + message.payloadString);
  console.log("Topic:     " + message.destinationName);
  console.log("QoS:       " + message.qos);
  console.log("Retained:  " + message.retained);
  // Read Only, set if message might be a duplicate sent from broker
  console.log("Duplicate: " + message.duplicate);
};

const body = document.querySelector("body"),
  sidebar = body.querySelector("nav"),
  toggle = body.querySelector(".toggle"),
  searchBtn = body.querySelector(".search-box"),
  modeSwitch = body.querySelector(".toggle-switch"),
  modeText = body.querySelector(".mode-text");

toggle.addEventListener("click", () => {
  sidebar.classList.toggle("close");
});

searchBtn.addEventListener("click", () => {
  sidebar.classList.remove("close");
});

modeSwitch.addEventListener("click", () => {
  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    modeText.innerText = "Light mode";
  } else {
    modeText.innerText = "Dark mode";
  }
});

function getData() {
  return data;
}

let layout = {
  title: "Basic Line Chart",
  yaxis: {
    range: [0, 100],
  },
  xaxis: {
    tickformat: "%d/%m/%y",
  },
};

//https://plot.ly/javascript/configuration-options/
let config = {
  responsive: true,
  // staticPlot: true,
  editable: true,
};

Plotly.plot(
  "plot",
  [
    {
      y: [getData()],
      type: "line",
    },
  ],
  layout,
  config
);

var cnt = 0;

setInterval(function () {
  Plotly.extendTraces("plot", { y: [[getData()]] }, [0]);
  cnt++;

  if (cnt > 500) {
    Plotly.relayout("chart", {
      xaxis: {
        range: [cnt - 500, cnt],
      },
    });
  }
}, 2000);
