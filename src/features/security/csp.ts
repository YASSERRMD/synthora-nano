export interface CSPConfig {
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  fontSrc: string[];
  connectSrc: string[];
  objectSrc: string[];
  frameSrc: string[];
  reportUri?: string;
}

const DEFAULT_CSP: CSPConfig = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "blob:"],
  fontSrc: ["'self'"],
  connectSrc: ["'self'"],
  objectSrc: ["'none'"],
  frameSrc: ["'none'"],
};

export function generateCSPHeader(config: Partial<CSPConfig> = {}): string {
  const csp = { ...DEFAULT_CSP, ...config };

  const directives: string[] = [
    `default-src ${csp.defaultSrc.join(" ")}`,
    `script-src ${csp.scriptSrc.join(" ")}`,
    `style-src ${csp.styleSrc.join(" ")}`,
    `img-src ${csp.imgSrc.join(" ")}`,
    `font-src ${csp.fontSrc.join(" ")}`,
    `connect-src ${csp.connectSrc.join(" ")}`,
    `object-src ${csp.objectSrc.join(" ")}`,
    `frame-src ${csp.frameSrc.join(" ")}`,
  ];

  return directives.join("; ");
}

export function applyCSP(config?: Partial<CSPConfig>): void {
  const meta = document.createElement("meta");
  meta.httpEquiv = "Content-Security-Policy";
  meta.content = generateCSPHeader(config);
  document.head.appendChild(meta);
}
