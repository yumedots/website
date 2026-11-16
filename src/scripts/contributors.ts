import { gh } from "./gh.ts";

// Each avatar rests as quiet halftone: grey dots on black, one per 4px cell, sized by brightness and
// never touching. The grid never moves. Under the pointer the dots light up in the photo's own hues,
// and the very centre fades through to the real picture. One offscreen WebGL canvas renders every
// avatar into its own 2D canvas, and only when something changes: no timers.
const VERT = "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
const FRAG = `precision mediump float;
uniform sampler2D tex;uniform vec2 mouse;varying vec2 uv;
const float N=16.;
void main(){
  vec2 g=uv*N,c=(floor(g)+.5)/N;
  vec3 s=texture2D(tex,c).rgb;
  float lum=dot(s,vec3(.299,.587,.114));
  // Reach of the pointer, measured at the cell so each dot changes as a whole.
  float k=1.-smoothstep(.1,.55,distance(c,mouse));
  float radius=sqrt(lum)*.42+.06*k;
  float dots=1.-smoothstep(radius-.06,radius+.06,length(fract(g)-.5));
  vec3 hue=s/max(max(s.r,s.g),max(s.b,.001));
  vec3 ink=mix(vec3(.6),hue,smoothstep(.05,.5,k));
  // The real picture, only where the pointer is.
  float photo=smoothstep(.55,1.,1.-smoothstep(.0,.3,distance(uv,mouse)));
  gl_FragColor=vec4(mix(ink*dots,texture2D(tex,uv).rgb,photo),1.);
}`;

interface Face { ctx: CanvasRenderingContext2D; tex: WebGLTexture }

const section = document.getElementById("contributors")!;
const list = document.getElementById("people")!;
const surface = document.createElement("canvas");
const gl = surface.getContext("webgl", { alpha: false });
const faces = new Map<Element, Face>();
let mouse: WebGLUniformLocation | null;
let current: Element | null = null;

function shader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src); gl.compileShader(s);
  return s;
}

if (gl) {
  surface.width = surface.height = Math.round(64 * (devicePixelRatio || 1));
  gl.viewport(0, 0, surface.width, surface.height);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  mouse = gl.getUniformLocation(prog, "mouse");
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
}

function upload(gl: WebGLRenderingContext, img: HTMLImageElement) {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
  for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR);
  for (const k of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE);
  return t;
}

// x, y are 0..1 across the avatar, y up; off the avatar (-1) there is no pointer.
function draw(a: Element, x = -1, y = -1) {
  const { ctx, tex } = faces.get(a)!;
  gl!.bindTexture(gl!.TEXTURE_2D, tex);
  gl!.uniform2f(mouse, x, y);
  gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
  ctx.drawImage(surface, 0, 0);
}

function leave() {
  if (current) draw(current);
  current = null;
}

function enter(a: Element | null, x = .5, y = .5) {
  if (!a || !faces.has(a)) return leave();
  if (a !== current) leave();
  current = a;
  draw(a, x, y);
}

// The photo stays as the fallback until its halftone canvas is ready.
function halftone(a: Element, img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = surface.width;
  canvas.setAttribute("aria-hidden", "true");
  faces.set(a, { ctx: canvas.getContext("2d")!, tex: upload(gl!, img) });
  draw(a);
  img.replaceWith(canvas);
}

if (gl) {
  list.addEventListener("pointermove", e => {
    const a = (e.target as Element).closest("a");
    if (!a) return leave();
    const r = a.getBoundingClientRect();
    enter(a, (e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
  });
  list.addEventListener("pointerleave", leave);
  list.addEventListener("focusin", e => enter((e.target as Element).closest("a")));
  list.addEventListener("focusout", leave);
}

interface Contributor { login: string; html_url: string; avatar_url: string; type: string }

gh<Contributor[]>("repos/yumedots/dotfiles/contributors?per_page=24").then(people => {
  for (const { login, html_url, avatar_url, type } of people) {
    if (type !== "User") continue;
    const li = document.createElement("li"), a = document.createElement("a"), img = new Image(64, 64);
    a.href = html_url; a.title = login; a.setAttribute("aria-label", login);
    // CORS-enabled and at 4x the 64px it shows, so the shader can sample it and it stays sharp.
    img.crossOrigin = "anonymous"; img.alt = "";
    img.src = `${avatar_url}${avatar_url.includes("?") ? "&" : "?"}s=256`;
    if (gl) img.addEventListener("load", () => halftone(a, img));
    a.append(img); li.append(a); list.append(li);
  }
  section.hidden = !list.children.length;
}).catch(() => {});
