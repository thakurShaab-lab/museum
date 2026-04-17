export function buildVisitorQrPayload(visitor) {
  return {
    version: "1.0",
    visitor_unique_id: visitor.visitor_id,
    visitor_name: `${visitor.first_name} ${visitor.last_name}`.trim(),
    ticket_package_details: visitor.package_details,
    ticket_type: visitor.ticket_type,
    date_time_slot: {
      slot_start: visitor.time_slot_start,
      slot_end: visitor.time_slot_end
    },
    verification: {
      registration_status: visitor.registration_status || "ACTIVE",
      valid_from: visitor.valid_from,
      valid_until: visitor.valid_until
    }
  };
}

export function buildQrImageUrl(qrPayload) {
  const encoded = encodeURIComponent(JSON.stringify(qrPayload));
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;
}
