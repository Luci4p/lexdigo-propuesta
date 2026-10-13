// Comportamiento compartido por todas las páginas de la maqueta LexDigo

// 0. Idioma de la página (las páginas en inglés están en la carpeta en/ con <html lang="en">)
const EN = document.documentElement.lang === 'en';
const T = (es, en) => EN ? en : es;
// Los enlaces ES | EN llevan a la misma página en el otro idioma
const archivoActual = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('[data-cambiar-idioma]').forEach(a => { a.href = (EN ? '../' : 'en/') + archivoActual; });
// Marca que hay JavaScript (las animaciones solo se activan si funciona)
document.documentElement.classList.add('js');

// 1. Cabecera: se pone oscura al bajar
const cabecera = document.getElementById('cabecera');
const revisarCabecera = () => cabecera.classList.toggle('con-fondo', window.scrollY > 20);
window.addEventListener('scroll', revisarCabecera, { passive: true });
revisarCabecera();

// 1b. Mega menú: se abre al pasar el ratón o al hacer clic; Escape lo cierra
const botonesMenu = document.querySelectorAll('.menu-boton');
let temporizador;
const cerrarMegas = () => {
  botonesMenu.forEach(b => b.setAttribute('aria-expanded', 'false'));
  document.querySelectorAll('.mega').forEach(m => m.classList.remove('abierto'));
  cabecera.classList.remove('menu-abierto');
};
let abiertoEn = 0;
const abrirMega = boton => {
  clearTimeout(temporizador);
  if (boton.getAttribute('aria-expanded') === 'true') return;
  abiertoEn = Date.now();
  cerrarMegas();
  boton.setAttribute('aria-expanded', 'true');
  document.getElementById(boton.dataset.mega).classList.add('abierto');
  cabecera.classList.add('menu-abierto');
};
botonesMenu.forEach(boton => {
  boton.addEventListener('mouseenter', () => abrirMega(boton));
  // Si se acaba de abrir al pasar el ratón, el clic no lo cierra
  boton.addEventListener('click', () => {
    if (boton.getAttribute('aria-expanded') !== 'true') abrirMega(boton);
    else if (Date.now() - abiertoEn > 400) cerrarMegas();
  });
});
cabecera.addEventListener('mouseleave', () => { temporizador = setTimeout(cerrarMegas, 200); });
cabecera.addEventListener('mouseenter', () => clearTimeout(temporizador));
document.querySelectorAll('.menu > a, .mega a').forEach(a => a.addEventListener('click', cerrarMegas));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { cerrarMegas(); cerrarMovil(); } });

// 1c. Menú móvil: se construye copiando los enlaces de los mega menús (así no hay que mantenerlos dos veces)
const menuMovil = document.getElementById('menu-movil');
const hamburguesa = document.querySelector('.hamburguesa');
botonesMenu.forEach(boton => {
  const grupo = document.createElement('details');
  const titulo = document.createElement('summary');
  titulo.textContent = boton.textContent.trim();
  const lista = document.createElement('div');
  document.getElementById(boton.dataset.mega).querySelectorAll('.item').forEach(item => {
    const enlace = document.createElement('a');
    enlace.href = item.getAttribute('href');
    enlace.textContent = item.querySelector('b').firstChild.textContent.trim();
    lista.appendChild(enlace);
  });
  grupo.append(titulo, lista);
  menuMovil.appendChild(grupo);
});
menuMovil.insertAdjacentHTML('beforeend', `<a href="planes.html">${T('Planes', 'Pricing')}</a><a href="#contacto" class="btn btn-cobre">${T('Hablar con un consultor', 'Talk to a consultant')}</a>`);
const cerrarMovil = () => { menuMovil.classList.remove('abierto'); hamburguesa.setAttribute('aria-expanded', 'false'); cabecera.classList.remove('menu-abierto'); };
hamburguesa.addEventListener('click', () => {
  const abrir = !menuMovil.classList.contains('abierto');
  menuMovil.classList.toggle('abierto', abrir);
  hamburguesa.setAttribute('aria-expanded', abrir);
  cabecera.classList.toggle('menu-abierto', abrir);
});
menuMovil.addEventListener('click', e => { if (e.target.tagName === 'A') cerrarMovil(); });

// 2. Pestañas de sectores
document.querySelectorAll('.pestana').forEach(boton => {
  boton.addEventListener('click', () => {
    document.querySelectorAll('.pestana').forEach(b => b.setAttribute('aria-selected', 'false'));
    document.querySelectorAll('.contenido-pestana').forEach(p => p.hidden = true);
    boton.setAttribute('aria-selected', 'true');
    document.getElementById(boton.dataset.panel).hidden = false;
  });
});

// 3. Aparición suave de los bloques al entrar en pantalla
const observador = new IntersectionObserver(entradas => {
  entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observador.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.aparece').forEach(el => observador.observe(el));

// 4. Dibuja los iconos (cambia cada <i data-lucide="..."> por su SVG)
if (window.lucide) lucide.createIcons();

// 5. Enlaces que aún no tienen página: en vez de no hacer nada, avisan
const aviso = document.createElement('div');
aviso.className = 'aviso-flotante';
aviso.textContent = T('Página en preparación: esta maqueta aún no la incluye', 'Page coming soon: not included in this mockup yet');
document.body.appendChild(aviso);
let temporizadorAviso;
document.addEventListener('click', e => {
  const enlace = e.target.closest('a[href="#"]');
  if (!enlace) return;
  e.preventDefault();
  aviso.classList.add('visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove('visible'), 2200);
});

// 6. Enlaces que abren un mega menú (p. ej. "Ver todas las funcionalidades")
document.querySelectorAll('[data-abrir-mega]').forEach(enlace => {
  enlace.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const boton = document.querySelector(`.menu-boton[data-mega="${enlace.dataset.abrirMega}"]`);
    if (window.matchMedia('(max-width: 1000px)').matches) { document.querySelector('.hamburguesa').click(); return; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => boton.click(), 350);
  });
});

// 7. Formulario: valida los campos obligatorios y muestra el mensaje de gracias
//    (en la web real, esto lo hará Contact Form 7 de WordPress y enviará el correo)
const formulario = document.getElementById('formulario-precios');
if (formulario) {
  const botonEnviar = formulario.querySelector('.enviar');
  formulario.querySelectorAll('input[name="interes"]').forEach(r => r.addEventListener('change', () => {
    botonEnviar.firstChild.textContent = r.value === 'prueba' ? T('Empezar prueba gratis ', 'Start free trial ') : T('Pedir mi demo ', 'Book my demo ');
  }));
  botonEnviar.firstChild.textContent = T('Pedir mi demo ', 'Book my demo ');
  formulario.addEventListener('submit', e => {
    e.preventDefault();
    formulario.classList.add('intentado');
    if (!formulario.checkValidity()) { formulario.reportValidity(); return; }
    formulario.querySelectorAll('.interes, .campos, .casilla, .enviar').forEach(el => el.hidden = true);
    const nombre = formulario.nombre.value.trim();
    formulario.querySelector('.gracias b').textContent = T(`¡Gracias, ${nombre}!`, `Thank you, ${nombre}!`);
    formulario.querySelector('.gracias').hidden = false;
    formulario.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

// 8. Planes: cambia los precios entre pago anual y mensual
document.querySelectorAll('.selector-pago button').forEach(boton => {
  boton.addEventListener('click', () => {
    document.querySelectorAll('.selector-pago button').forEach(b => { b.classList.remove('activo'); b.setAttribute('aria-pressed', 'false'); });
    boton.classList.add('activo');
    boton.setAttribute('aria-pressed', 'true');
    document.querySelectorAll('[data-anual]').forEach(precio => { precio.textContent = precio.dataset[boton.dataset.pago]; });
  });
});

// 9. Capturas: al pulsar una, se abre en grande (Escape o clic para cerrar)
const capturas = document.querySelectorAll('img.captura');
if (capturas.length) {
  const visor = document.createElement('div');
  visor.className = 'visor';
  visor.innerHTML = `<img alt=""><button type="button" aria-label="${T('Cerrar', 'Close')}">×</button>`;
  document.body.appendChild(visor);
  const cerrarVisor = () => visor.classList.remove('abierto');
  capturas.forEach(img => img.addEventListener('click', () => {
    visor.querySelector('img').src = img.src;
    visor.querySelector('img').alt = img.alt;
    visor.classList.add('abierto');
  }));
  visor.addEventListener('click', cerrarVisor);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarVisor(); });
}

// 10. El menú marca en qué página estás (sección y enlace resaltados)
document.querySelectorAll('.mega .item, .menu > a').forEach(enlace => {
  const destino = (enlace.getAttribute('href') || '').split('#')[0];
  if (destino && destino === archivoActual) {
    enlace.classList.add('actual');
    const mega = enlace.closest('.mega');
    if (mega) document.querySelector(`.menu-boton[data-mega="${mega.id}"]`)?.classList.add('seccion-actual');
  }
});
