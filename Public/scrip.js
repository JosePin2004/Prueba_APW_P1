//====================================
// SELECCIONES DEL DOM
//====================================
// Obtiene referencias a todos los elementos HTML principales
const grid = document.querySelector('#grid-videogames'); // Contenedor donde se mostrarán las tarjetas de juegos
const estadoCarga = document.querySelector('#estado-de-carga'); // Mensaje de "Cargando..."
const mensajeError = document.querySelector('#mensaje-de-error'); // Mensaje de error cuando no hay resultados
const inputBusqueda = document.querySelector('#input-busqueda'); // Campo de texto para buscar juegos
const btnBuscar = document.querySelector('#btn-buscar'); // Botón para ejecutar la búsqueda
const selectPlataforma = document.querySelector('#select-plataforma'); // Selector de plataforma (PC, PS5, Xbox, etc)
const selectOrdenar = document.querySelector('#select-ordenar'); // Selector para ordenar (rating, reciente, nombre)
const btnVerMas = document.querySelector('#btn-ver-mas'); // Botón para cargar más juegos
const modalDetalles = document.querySelector('#modal-detalles'); // Modal que muestra detalles del juego seleccionado
const btnCerrarModal = document.querySelector('#btn-cerrar-modal'); // Botón X para cerrar el modal

//====================================
// VARIABLES DE CONTROL GLOBALES
//====================================
let paginaActual = 0; // Controla qué página de juegos estamos mostrando
const juegosPorPagina = 12; // Cantidad de juegos a mostrar por página
let juegosEnCache = []; // Almacena todos los juegos cargados de la API
let juegosActuales = []; // Almacena los juegos después de aplicar filtros
let busquedaActiva = false; // Bandera para saber si hay búsqueda activa


//====================================
// FUNCIÓN: RENDERIZAR VIDEOJUEGOS
//====================================
// Convierte un array de juegos en tarjetas HTML y las agrega al grid
// @param lista - Array de objetos juego con propiedades como title, thumb, precio, etc
//Función para pintar las cards//
function renderizarVideojuegos(lista) {
    if (!grid) {
        console.error('Grid no encontrado');
        return;
    }
    
    // No limpiar el grid, agregar nuevos elementos (permite paginación)

    lista.forEach((juego) => {
        //Ajusta los nombres de las propiedades según la API//
        const titulo = juego.title || juego.external || "Juego";
        const thumb = juego.thumb || juego.thumbnail || "";

        //Precios y ahorro con fallbacks - mostrar guión si no está disponible//
        const normal = juego.normalPrice ?? "_";
        const oferta = juego.salePrice ?? juego.cheapest ?? "_";

        //Ahorro redondeado si existe o null si no//
        const ahorro = juego.savings ? Math.round(juego.savings) : null;

        //Crear el html de la card//
        const card = document.createElement('article');
        card.className = 'bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 flex flex-col';

        //Contenido de la card con estilos Tailwind//
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

        //Agregar evento al botón Ver detalles para abrir el modal//
        const btnDetalles = card.querySelector('button');
        btnDetalles.addEventListener('click', () => abrirModal(juego));

        //Agregar la card al grid//
        grid.appendChild(card);
    });
}

//====================================
// FUNCIÓN: APLICAR FILTROS Y ORDENAMIENTO
//====================================
// Filtra los juegos por búsqueda y aplica ordenamiento
// Busca coincidencias en el título y ordena según la opción seleccionada
//Función para filtrar por búsqueda y plataforma//
function aplicarFiltros() {
    const termino = inputBusqueda.value.toLowerCase(); // Obtiene el término de búsqueda en minúsculas
    const plataforma = selectPlataforma.value; // Obtiene la plataforma seleccionada
    
    // Filtra juegos que coincidan con el término de búsqueda
    let resultados = juegosEnCache.filter(juego => {
        const titulo = (juego.title || juego.external || "").toLowerCase();
        const cumpleBusqueda = titulo.includes(termino) || termino === ""; // Si está vacío, acepta todos
        return cumpleBusqueda;
    });
    
    // Aplica ordenamiento según la opción seleccionada
    const ordenar = selectOrdenar.value;
    if (ordenar === "rating") {
        // Ordena de mayor a menor puntuación (Metacritic)
        resultados.sort((a, b) => (b.metacriticScore || 0) - (a.metacriticScore || 0));
    } else if (ordenar === "recent") {
        // Ordena por fecha de lanzamiento (más recientes primero)
        resultados.sort((a, b) => (b.steamReleaseDate || 0) - (a.steamReleaseDate || 0));
    } else if (ordenar === "name") {
        // Ordena alfabéticamente por nombre
        resultados.sort((a, b) => (a.title || a.external || "").localeCompare(b.title || b.external || ""));
    }
    
    juegosActuales = resultados; // Guarda los resultados filtrados
    return resultados;
}

//====================================
// FUNCIÓN: ABRIR MODAL CON DETALLES
//====================================
// Abre un modal que muestra los detalles completos del juego seleccionado
// Incluye: nombre, imagen, precios, ahorro y enlace a la tienda
//Función para abrir modal con detalles//
function abrirModal(juego) {
    // Extrae la información del juego con valores por defecto
    const titulo = juego.title || juego.external || "Juego";
    const thumb = juego.thumb || juego.thumbnail || "";
    const normal = juego.normalPrice ?? "-";
    const oferta = juego.salePrice ?? juego.cheapest ?? "-";
    const ahorro = juego.savings ? Math.round(juego.savings) : "-";
    
    // Rellena el modal con la información del juego
    document.querySelector('#modal-titulo').textContent = titulo; // Título del juego
    document.querySelector('#modal-imagen').src = thumb; // Imagen del juego
    document.querySelector('#modal-imagen').alt = titulo;
    document.querySelector('#modal-precio-normal').textContent = normal !== "-" ? `$${normal}` : "No disponible";
    document.querySelector('#modal-precio-oferta').textContent = oferta !== "-" ? `$${oferta}` : "No disponible";
    document.querySelector('#modal-ahorro').textContent = ahorro !== "-" ? `${ahorro}%` : "No disponible";
    
    // Construye el enlace a la tienda (CheapShark)
    let enlaceURL = "#";
    if (juego.gameID) {
        // Si existe gameID, crea un enlace directo a Steam
        enlaceURL = `https://www.cheapshark.com/api/redirect/steam?appID=${juego.gameID}`;
    }
    
    document.querySelector('#modal-enlace-tienda').href = enlaceURL;
    
    // Muestra el modal eliminando la clase "hidden"
    modalDetalles.classList.remove('hidden');
}

//====================================
// FUNCIÓN: CERRAR MODAL
//====================================
// Cierra el modal de detalles agregando la clase "hidden"
//Función para cerrar modal//
function cerrarModal() {
    modalDetalles.classList.add('hidden');
}

//====================================
// FUNCIÓN: CARGAR VIDEOJUEGOS INICIAL
//====================================
// Carga los primeros juegos de la API al abrir la página
// Carga 60 juegos pero solo muestra los primeros 12
// Esto permite que la búsqueda funcione en un conjunto más amplio
//Cargar y renderizar videojuegos al inicio//
async function cargarVideojuegosInicial() {
    estadoCarga.classList.remove("hidden"); // Muestra "Cargando..."
    mensajeError.classList.add("hidden"); // Oculta mensajes de error previos
    grid.innerHTML = ''; // Limpia el grid anterior
    paginaActual = 0; // Reinicia el contador de páginas
    juegosEnCache = []; // Vacía el caché
    busquedaActiva = false;
    
    try {
        // Realiza una petición a la API de CheapShark
        // pageSize=60: Carga 60 juegos para mejor búsqueda local
        const url = `https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60&pageNumber=0`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("Error en la Respuesta de la API");
        }
        const data = await res.json(); // Convierte la respuesta a JSON
        juegosEnCache = data; // Almacena todos en caché
        juegosActuales = data;
        // Solo muestra los primeros 12 juegos (evita sobrecarga visual)
        renderizarVideojuegos(data.slice(0, juegosPorPagina));
        paginaActual++;
    }
    catch (e) {
        console.error("Error al cargar Cheapshark", e);
        mensajeError.textContent = "Error al cargar los juegos. Intenta más tarde.";
        mensajeError.classList.remove('hidden');
    }
    finally {
        estadoCarga.classList.add('hidden'); // Oculta el mensaje de carga
    }
}

//====================================
// FUNCIÓN: EJECUTAR BÚSQUEDA
//====================================
// Ejecuta la búsqueda y aplicación de filtros
// Limpia el grid y muestra solo los resultados que coinciden
//Función de búsqueda//
function ejecutarBusqueda() {
    estadoCarga.classList.remove("hidden");
    grid.innerHTML = ''; // Limpia los resultados previos
    
    // Aplica los filtros (búsqueda + ordenamiento)
    const resultados = aplicarFiltros();
    
    // Verifica si hay resultados
    if (resultados.length === 0) {
        mensajeError.textContent = "No se encontraron videojuegos con ese criterio.";
        mensajeError.classList.remove('hidden');
    } else {
        mensajeError.classList.add('hidden');
        // Renderiza los juegos encontrados
        renderizarVideojuegos(resultados);
    }
    
    estadoCarga.classList.add('hidden');
}

//====================================
// FUNCIÓN: CARGAR MÁS JUEGOS
//====================================
// Carga la siguiente página de juegos cuando el usuario hace clic en "Ver más"
// Agrega los nuevos juegos al final del grid actual
//Cargar más juegos//
async function cargarMasJuegos() {
    estadoCarga.classList.remove("hidden");
    mensajeError.classList.add("hidden");
    btnVerMas.disabled = true; // Desactiva el botón mientras carga
    
    try {
        // Solicita la siguiente página de juegos
        const url = `https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=${juegosPorPagina}&pageNumber=${paginaActual}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("Error en la Respuesta de la API");
        }
        const data = await res.json();
        
        // Verifica si la página está vacía (fin de resultados)
        if (data.length === 0) {
            mensajeError.textContent = "No hay más juegos disponibles";
            mensajeError.classList.remove('hidden');
            btnVerMas.disabled = false;
            return;
        }
        
        // Renderiza los nuevos juegos (se agregan al grid existente)
        renderizarVideojuegos(data);
        paginaActual++; // Incrementa el contador de página
        btnVerMas.disabled = false; // Reactiva el botón
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

//====================================
// EVENTOS (EVENT LISTENERS)
//====================================
// Asigna funciones a los botones y selectores cuando ocurren eventos

// Botón "Ver más" - Carga la siguiente página de juegos
if (btnVerMas) {
    btnVerMas.addEventListener('click', cargarMasJuegos);
}

// Botón "Buscar" - Ejecuta la búsqueda con los filtros aplicados
if (btnBuscar) {
    btnBuscar.addEventListener('click', ejecutarBusqueda);
}

// Input de búsqueda - Busca al presionar Enter
if (inputBusqueda) {
    inputBusqueda.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            ejecutarBusqueda();
        }
    });
}

// Selector de plataforma - Aplica filtros al cambiar
if (selectPlataforma) {
    selectPlataforma.addEventListener('change', ejecutarBusqueda);
}

// Selector de ordenamiento - Aplica ordenamiento al cambiar
if (selectOrdenar) {
    selectOrdenar.addEventListener('change', ejecutarBusqueda);
}

// Botón cerrar modal (X) - Cierra el modal de detalles
if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', cerrarModal);
}

// Cierra el modal al hacer clic fuera de él (en el fondo oscuro)
if (modalDetalles) {
    modalDetalles.addEventListener('click', (e) => {
        if (e.target === modalDetalles) {
            cerrarModal();
        }
    });
}

//====================================
// INICIALIZACIÓN
//====================================
// Ejecuta la función de carga inicial cuando la página termina de cargar
cargarVideojuegosInicial();