export type RoleId = "vendor" | "volunteer" | "sponsor";

export type RoleField = {
  name: string;
  label: string;
  type?: "text" | "tel" | "email" | "textarea";
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
};

export type Role = { title: string; label: string; fields: RoleField[] };

const NAME: RoleField = { name: "name", label: "Your name", required: true, autoComplete: "name" };
const PHONE: RoleField = { name: "phone", label: "Phone number", type: "tel", required: true, autoComplete: "tel", placeholder: "10-digit mobile number" };
const NOTES: RoleField = { name: "notes", label: "Anything else", type: "textarea" };

/** One entry per "Apply as …" button. Field labels double as the lines of the WhatsApp message. */
export const ROLES: Record<RoleId, Role> = {
  vendor: {
    title: "Apply as a Vendor",
    label: "Vendor",
    fields: [
      NAME,
      { name: "brand", label: "Brand or business name", required: true, autoComplete: "organization" },
      { name: "products", label: "What do you sell?", type: "textarea", required: true, placeholder: "e.g. handmade jewellery, home décor, baked goods" },
      PHONE,
      { name: "instagram", label: "Instagram or website", placeholder: "@yourbrand" },
      NOTES,
    ],
  },
  volunteer: {
    title: "Apply as a Volunteer",
    label: "Volunteer",
    fields: [
      NAME,
      PHONE,
      { name: "area", label: "Which area of Vizag are you from?" },
      { name: "help", label: "How would you like to help?", type: "textarea", required: true, placeholder: "e.g. setting up, guiding guests, kids' workshops, photography" },
      NOTES,
    ],
  },
  sponsor: {
    title: "Apply as a Sponsor",
    label: "Sponsor",
    fields: [
      NAME,
      { name: "company", label: "Company or brand", required: true, autoComplete: "organization" },
      PHONE,
      { name: "email", label: "Email", type: "email", autoComplete: "email" },
      NOTES,
    ],
  },
};

export const isRoleId = (v: string): v is RoleId => v in ROLES;

/** The WhatsApp message: a greeting, then one "Label: value" line per filled field. */
export function applicationMessage(role: Role, values: Record<string, string>) {
  const lines = role.fields
    .map((f) => [f.label.replace(/\?$/, ""), (values[f.name] ?? "").trim()] as const)
    .filter(([, v]) => v)
    .map(([label, v]) => `*${label}:* ${v}`);
  return [`Hi Sea Soul Sandadi! I'd like to apply as a ${role.label}.`, "", ...lines].join("\n");
}
