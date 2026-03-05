export function waMessageAcceptedTable(opts: {
  restaurantName: string;
  customerName: string;
  whenText: string;
  guests: number;
  ref: string;
}) {
  return `Hi ${opts.customerName}! ✅ Your table booking at ${opts.restaurantName} is confirmed.
When: ${opts.whenText}
Guests: ${opts.guests}
Ref: ${opts.ref}

Reply here if you want to modify anything.`;
}

export function waMessageRejected(opts: {
  restaurantName: string;
  customerName: string;
  ref: string;
}) {
  return `Hi ${opts.customerName}! Thanks for contacting ${opts.restaurantName}.
We’re unable to accommodate this request right now. 🙏
Ref: ${opts.ref}

Share an alternate date/time and we’ll try our best.`;
}
