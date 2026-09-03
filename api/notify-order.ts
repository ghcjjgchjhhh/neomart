export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    response.status(500).json({ error: 'Notification topic is not configured' });
    return;
  }

  const { orderId, total } = request.body || {};
  if (typeof orderId !== 'string' || typeof total !== 'number') {
    response.status(400).json({ error: 'Invalid order notification' });
    return;
  }

  const notification = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
    method: 'POST',
    headers: {
      'Title': 'New NeoMart order',
      'Priority': 'high',
      'Tags': 'package,money_with_wings',
    },
    body: `Order #${orderId} received for NGN ${total.toLocaleString('en-NG')}.`,
  });

  if (!notification.ok) {
    response.status(502).json({ error: 'Notification provider failed' });
    return;
  }

  response.status(200).json({ sent: true });
}
