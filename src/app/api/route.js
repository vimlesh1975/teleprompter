import { CasparCG, Options, AMCP } from 'casparcg-connection';

var aa;
const connect = () => {
  aa = new CasparCG('127.0.0.1', 5250);
  aa.queueMode = Options.QueueMode.SEQUENTIAL;

  aa.onConnectionChanged = () => {
    console.log(aa.connected);
  };
  aa.onDisconnected = () => {
    console.log('disconnected');
  };
  aa.onConnected = () => {
    console.log('connected');
  };
};

export async function POST(req, res) {
  const body = await req.json();
  console.log(body);
  if (body.action === 'endpoint') {
    if (aa) {
      aa.do(new AMCP.CustomCommand(body.command));
    }

    return new Response('');
  }
  if (body.action === 'connect') {
    if (!aa) {
      connect();
    }
    return new Response(true);
  }
  if (body.action === 'disconnect') {
    if (aa) {
      aa = null;
    }
    return new Response(false);
  }
  return new Response('');
}