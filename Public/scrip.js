//Selecciones del DOM//
const grid = document.querySelector('#grid-videogames');
const estadoCarga = document.querySelector('#estado-de-carga');
const mensajeError = document.querySelector('#mensaje-de-error');
const inputBusqueda = document.querySelector('input[placeholder="Buscar videojuego..."]');

//Local data videogames si la API falla//
const videogames = [
    {
        title: "God of War",
        thumb: "https://gmedia.playstation.com/is/image/SIEPDC/god-of-war-listing-thumb-01-ps4-us-12jun17?$facebook$",
        normalPrice: "$59.99",
        salePrice: "$29.99",
        savings: 50,
        descripcion: "Acción · Aventura · PS4 / PS5",
        rating: 4.8,
    },
    {
        title: "Zelda: Tears of the Kingdom",
        thumb: "https://androidgram.com/wp-content/uploads/2023/05/Zelda-Tears-of-the-Kingdom-ToTK-All-Towns-Settlements-List-with-coordinates-2.jpg",
        normalPrice: "$69.99",
        salePrice: "$49.99",
        savings: 28,
        descripcion: "Aventura · Acción · Nintendo Switch",
        rating: 4.7,
    },
];

//Función para pintar las cards//
function renderizarVideojuegos(lista) {
    if (!grid) {
        console.error('Grid no encontrado');
        return;
    }
    
    grid.innerHTML = ''; // Limpiar el grid antes de renderizar

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
                  
                <button class="mt-2 w-full bg-slate-900 text-white py-2 rounded-lg text-sm hover:bg-slate-800">Ver detalles</button>        

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
    
    try {
        const url = "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=20";
        const res = await fetch(url); //espera a que se resuelva la api//
        if (!res.ok) {
            throw new Error("Error en la Respuesta de la API");
        }
        const data = await res.json(); //espera a que se convierta a json//
        window._juegosCache = data;
        renderizarVideojuegos(data);
    }
    catch (e) {
        console.error("Error al cargar Cheapshark", e);
        mensajeError.classList.remove('hidden');
        renderizarVideojuegos(videogames);
    }
    finally {
        estadoCarga.classList.add('hidden');
    }
}

//Ejecutar al cargar la página//
cargarVideojuegosInicial();