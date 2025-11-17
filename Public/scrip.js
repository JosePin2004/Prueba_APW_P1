//Selecciones del DOM//
const grid = document.querySelector('#grid-videogames');
const estadoCarga = document.querySelector('#estado-de-carga');
const mensajeError = document.querySelector('#mensaje-de-error');
const inputBusqueda = document.querySelector('input[placeholder="Buscar videojuego..."]');
const btnVerMas = document.querySelector('#btn-ver-mas');

//Variables de control//
let paginaActual = 0;
const juegosPorPagina = 12;


//Función para pintar las cards//
function renderizarVideojuegos(lista) {
    if (!grid) {
        console.error('Grid no encontrado');
        return;
    }
    
    // No limpiar el grid, agregar nuevos elementos

    lista.forEach((juego) => {
        //Ajusta los nombres de las propiedades según la API//
        const titulo = juego.title || juego.external || "Juego";
        const thumb = juego.thumb || juego.thumbnail || "";

        //Precios y ahorro con fallbacks//
        const normal = juego.normalPrice ?? "_";
        const oferta = juego.salePrice ?? juego.cheapest ?? "_";

        //Ahorro redondeado si existe o null si no//
        const ahorro = juego.savings ? Math.round(juego.savings) : null;

        //Crear el html de la card//
        const card = document.createElement('article');
        card.className = 'bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 flex flex-col';

        //Contenido de la card//
        card.innerHTML = `
            <img
              src="${thumb}"
              alt="${titulo}"
              class="h-40 w-full object-cover"
            />
            <div class="p-4 flex flex-col gap-2 flex-1">
                <h3 class="text-md font-semibold text-slate-900">${titulo}</h3>

                <p class="text-xs text-slate-500">
                  precio:${
                    normal && normal !== "_" ? ` <s>$${normal}</s>` : ""
                  }
                  ${
                    oferta && oferta !== "_" ? ` . <span class="font-bold text-green-900">$${oferta}</span>` : ""
                  }
                  ${ahorro ? ` . Ahorra ${ahorro}%` : ""}
                </p>
                  

                <p class="text-sm text-slate-600 flex-1">${juego.descripcion || ""}</p>
                <div class="mt-4 flex items-center justify-between">
                    <span class="text-yellow-500 font-semibold">⭐ ${juego.rating || "N/A"}</span>
                    <button class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800">Ver detalles</button>
                </div>
            </div>
        `;
        //Agregar la card al grid//
        grid.appendChild(card);
    });
}

//Cargar y renderizar videojuegos al inicio//
async function cargarVideojuegosInicial() {
    estadoCarga.classList.remove("hidden");
    mensajeError.classList.add("hidden");
    grid.innerHTML = '';
    paginaActual = 0;
    
    try {
        const url = `https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=${juegosPorPagina}&pageNumber=${paginaActual}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("Error en la Respuesta de la API");
        }
        const data = await res.json();
        window._juegosCache = data;
        renderizarVideojuegos(data);
        paginaActual++;
    }
    catch (e) {
        console.error("Error al cargar Cheapshark", e);
        mensajeError.classList.remove('hidden');
    }
    finally {
        estadoCarga.classList.add('hidden');
    }
}

//Cargar más juegos//
async function cargarMasJuegos() {
    estadoCarga.classList.remove("hidden");
    mensajeError.classList.add("hidden");
    btnVerMas.disabled = true;
    
    try {
        const url = `https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=${juegosPorPagina}&pageNumber=${paginaActual}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("Error en la Respuesta de la API");
        }
        const data = await res.json();
        
        if (data.length === 0) {
            mensajeError.textContent = "No hay más juegos disponibles";
            mensajeError.classList.remove('hidden');
            btnVerMas.disabled = false;
            return;
        }
        
        renderizarVideojuegos(data);
        paginaActual++;
        btnVerMas.disabled = false;
    }
    catch (e) {
        console.error("Error al cargar más juegos", e);
        mensajeError.classList.remove('hidden');
        btnVerMas.disabled = false;
    }
    finally {
        estadoCarga.classList.add('hidden');
    }
}

//Event listeners//
if (btnVerMas) {
    btnVerMas.addEventListener('click', cargarMasJuegos);
}

//Ejecutar al cargar la página//
cargarVideojuegosInicial();