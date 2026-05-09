const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const iconMap = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" {...iconProps} />
      <path d="M5 9.5V21h14V9.5" {...iconProps} />
      <path d="M9 21v-6h6v6" {...iconProps} />
    </>
  ),
  courses: (
    <>
      <path d="M4 6.5c2.2-1 4.5-1.5 7-1.5s4.8.5 7 1.5v11c-2.2-1-4.5-1.5-7-1.5s-4.8.5-7 1.5Z" {...iconProps} />
      <path d="M11 5v12" {...iconProps} />
      <path d="M6.5 9h2.5" {...iconProps} />
      <path d="M13.5 9H16" {...iconProps} />
    </>
  ),
  gallery: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" {...iconProps} />
      <path d="m7.5 15 3.2-3.2a1.4 1.4 0 0 1 2 0l1.9 1.9" {...iconProps} />
      <path d="m13 16 1.8-1.8a1.4 1.4 0 0 1 2 0L19 16.5" {...iconProps} />
      <path d="M9 9h.01" {...iconProps} />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="4" width="8" height="7" rx="2" {...iconProps} />
      <rect x="13" y="4" width="8" height="12" rx="2" {...iconProps} />
      <rect x="3" y="13" width="8" height="7" rx="2" {...iconProps} />
      <path d="M13 18h8" {...iconProps} />
    </>
  ),
  students: (
    <>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" {...iconProps} />
      <path d="M5 20a7 7 0 0 1 14 0" {...iconProps} />
      <path d="M4 8.5a2.5 2.5 0 0 1 0-5" {...iconProps} />
      <path d="M20 8.5a2.5 2.5 0 0 0 0-5" {...iconProps} />
    </>
  ),
  fees: (
    <>
      <path d="M4 7h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" {...iconProps} />
      <path d="M4 9c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" {...iconProps} />
      <path d="M12 12v4" {...iconProps} />
      <path d="M10 14h4" {...iconProps} />
    </>
  ),
  placements: (
    <>
      <path d="M4 20h16" {...iconProps} />
      <path d="M7 20v-8h4v8" {...iconProps} />
      <path d="M13 20V8h4v12" {...iconProps} />
      <path d="M8 8.5 12 4l4 4.5" {...iconProps} />
    </>
  ),
  materials: (
    <>
      <path d="M7 4h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" {...iconProps} />
      <path d="M14 4v5h5" {...iconProps} />
      <path d="M9 13h6" {...iconProps} />
      <path d="M9 17h6" {...iconProps} />
    </>
  ),
  tests: (
    <>
      <path d="M7 5h10a2 2 0 0 1 2 2v10l-3 3H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" {...iconProps} />
      <path d="m9 11 1.5 1.5L15 8" {...iconProps} />
      <path d="M9 16h6" {...iconProps} />
    </>
  ),
  jobs: (
    <>
      <rect x="4" y="7" width="16" height="12" rx="2" {...iconProps} />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" {...iconProps} />
      <path d="M4 12h16" {...iconProps} />
      <path d="M11 12v2h2v-2" {...iconProps} />
    </>
  ),
  certificates: (
    <>
      <path d="M12 3 4 7v5c0 5.2 3.4 8.7 8 10 4.6-1.3 8-4.8 8-10V7Z" {...iconProps} />
      <path d="m9.5 12 1.6 1.6 3.4-3.6" {...iconProps} />
    </>
  ),
  interviews: (
    <>
      <path d="M8 9.5h8" {...iconProps} />
      <path d="M8 13h5" {...iconProps} />
      <path d="M6 4h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" {...iconProps} />
    </>
  ),
  whatsapp: (
    <>
      <path d="M6.5 18 5 21l3.3-1.4A8.5 8.5 0 1 0 3.5 12" {...iconProps} />
      <path d="M9.4 9.2c.2-.5.5-.5.8-.5h.6c.2 0 .4 0 .6.5.2.4.8 1.9.9 2 .1.2.1.4 0 .7l-.4.6c-.1.2-.3.4-.1.7.2.3.8 1.3 1.8 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1c.2-.2.4-.3.7-.2.3.1 2 .9 2.3 1 .3.1.5.2.6.3.1.2.1 1-.2 1.8-.3.7-1.6 1.4-2.1 1.5-.5 0-1.2.2-3.9-.9-3.2-1.3-5.2-4.5-5.3-4.7-.1-.2-1.3-1.8-1.3-3.5 0-1.6.8-2.4 1.2-2.8Z" {...iconProps} />
    </>
  ),
  leads: (
    <>
      <path d="M13.5 3.5a5 5 0 1 1-3.2 8.8L4 18.6V21h2.4l1.1-1.1H10l1.1-1.1V17l.7-.7a5 5 0 0 1 1.7-12.6Z" {...iconProps} />
      <path d="M15.5 8.5h.01" {...iconProps} />
    </>
  ),
  profile: (
    <>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" {...iconProps} />
      <path d="M4 20a8 8 0 0 1 16 0" {...iconProps} />
    </>
  ),
  login: (
    <>
      <path d="M10 17 15 12 10 7" {...iconProps} />
      <path d="M15 12H4" {...iconProps} />
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" {...iconProps} />
    </>
  ),
  admin: (
    <>
      <path d="M12 3 5 6v6c0 4.3 2.5 7.4 7 9 4.5-1.6 7-4.7 7-9V6Z" {...iconProps} />
      <path d="M12 8v8" {...iconProps} />
      <path d="M8.5 11.5h7" {...iconProps} />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5" {...iconProps} />
      <path d="M4 17v-5h5" {...iconProps} />
      <path d="M6.8 10A7 7 0 0 1 18.7 7L20 8" {...iconProps} />
      <path d="M17.2 14A7 7 0 0 1 5.3 17L4 16" {...iconProps} />
    </>
  ),
  logout: (
    <>
      <path d="M10 17 15 12 10 7" {...iconProps} />
      <path d="M15 12H7" {...iconProps} />
      <path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6" {...iconProps} />
    </>
  ),
  message: (
    <>
      <path d="M4 6h16v12H7l-3 3V6Z" {...iconProps} />
      <path d="m6 8 6 4 6-4" {...iconProps} />
    </>
  ),
  phone: (
    <>
      <path d="M7.5 4.5c.4-.4 1-.5 1.5-.2l2.2 1.4c.6.4.8 1.1.5 1.8l-.7 1.5c-.2.4-.1.8.1 1.2a15 15 0 0 0 3.7 3.7c.4.2.8.3 1.2.1l1.5-.7c.7-.3 1.4-.1 1.8.5l1.4 2.2c.3.5.2 1.1-.2 1.5l-1.2 1.2c-.7.7-1.7 1-2.7.8-2.2-.4-5.6-1.8-8.7-4.9S4.9 9.1 4.5 6.9c-.2-1 .1-2 .8-2.7Z" {...iconProps} />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" {...iconProps} />
      <path d="M8 3v4" {...iconProps} />
      <path d="M16 3v4" {...iconProps} />
      <path d="M4 10h16" {...iconProps} />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" {...iconProps} />
      <path d="m19 3 .7 2 .3.3 2 .7-2 .7-.3.3-.7 2-.7-2-.3-.3-2-.7 2-.7.3-.3Z" {...iconProps} />
      <path d="m5 15 .7 2 .3.3 2 .7-2 .7-.3.3-.7 2-.7-2-.3-.3-2-.7 2-.7.3-.3Z" {...iconProps} />
    </>
  ),
};

function AppIcon({ name, className = "", size = 20 }) {
  return (
    <span className={`app-icon ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={size} height={size}>
        {iconMap[name] || iconMap.spark}
      </svg>
    </span>
  );
}

export default AppIcon;
