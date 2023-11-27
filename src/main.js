const { invoke } = window.__TAURI__.tauri;
let posicionVenta = 0;
let buscadorInput;
const mensaje1 = document.querySelector('#mensaje1-msg');
let tpProd;
let mark;
let variety;
let amount;
let pres;
let cod;
let precio_de_venta;
let precio_de_costo;
let percent;
let timeoutId;
let proveedores = [];
let proveedores_producto = [];
let codigosProv = [];
let configs;
let idUlt;

get_configs().then(conf => {
  configs = conf;
})


async function buscador() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  mensaje1.textContent = await invoke("buscador", { name: buscadorInput.value });
}

window.addEventListener("DOMContentLoaded", () => {
  let inputProductos = document.querySelector('#input-productos');
  let productos = document.querySelector('#productos');
  inputProductos.addEventListener('keydown', (e) => {
    if (idUlt && e.keyCode == 13 && inputProductos.value.length == 0) {
      agregarProdVentaAct(idUlt)
    }
  })
  inputProductos.addEventListener('input', (e) => {

    e.target.parentNode.nextElementSibling.innerHTML = '';
    buscarProducto(inputProductos.value).then(res => {
      productos.innerHTML = '';
      if (res.length > configs.cantidad_productos) {
        for (let i = 0; i < configs.cantidad_productos; i++) {
          productos.innerHTML += `<option class="opcion-producto" id="${res[i].id}" value="${formatear_strings(formatear_descripcion(res[i]))}"></option>`
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          productos.innerHTML += `<option class="opcion-producto" id="${res[i].id}" value="${formatear_strings(formatear_descripcion(res[i]))}"></option>`
        }
      }
      let opciones = document.getElementsByClassName('opcion-producto');
      for (let i = 0; i < opciones.length; i++) {
        if (opciones[i].value.length == inputProductos.value.length && opciones[i].value == inputProductos.value) {
          inputProductos.value = '';
          agregarProdVentaAct(opciones[i].id);
          idUlt = opciones[i].id;
          // console.log(opciones[i].id);
          get_venta_actual(posicionVenta).then(venta => {
            dibujar_venta(venta)
          })


        }
      }

    })



  })

})




function sumarProducto(e) {
  agregarProdVentaAct(e.target.parentNode.parentNode.id);
  borrarBusqueda();
}
function restarProducto(e) {
  let cantidad = e.target.nextElementSibling;
  descontarProdVentaAct(e.target.parentNode.parentNode.id);
  borrarBusqueda();
}

function eliminarProducto(e) {
  eliminarProdVentaAct(e.target.parentNode.parentNode.id);
  borrarBusqueda();
}
function camalize(str) {
  return str.replace(/(\w)(\w*)/g,
    function (g0, g1, g2) { return g1.toUpperCase() + g2.toLowerCase(); });
}
function formatear_descripcion(producto) {
  let pres;
  let cant;
  switch (Object.keys(producto.presentacion)[0]) {
    case 'Gr': {
      pres = "Gr";
      cant = producto.presentacion.Gr;
      break;
    }
    case 'Un': {
      pres = "Un";
      cant = producto.presentacion.Un;
      break;
    }
    case "Lt": {
      pres = "Lt";
      cant = producto.presentacion.Lt;
      break;
    }
    case "Ml": {
      pres = "Ml";
      cant = producto.presentacion.Ml;
      break;
    }
    case "Cc": {
      pres = "Cc";
      cant = producto.presentacion.Cc;
      break;
    }
    case "Kg": {
      pres = "Kg";
      cant = producto.presentacion.Kg;
      break;
    }
  }
  switch (configs.formato_producto) {
    case "Tmv":
      return `${producto.tipo_producto} ${producto.marca} ${producto.variedad} ${cant} ${pres}`;
    case "Mtv":
      return `${producto.marca} ${producto.tipo_producto} ${producto.variedad} ${cant} ${pres}`;
  }


}
function formatear_strings(strings) {


  switch (configs.modo_mayus) {
    case "Upper":
      return strings.toUpperCase();
    case "Lower":
      return strings.toLowerCase();
    case "Camel":
      return camalize(strings);
  }



}
async function dibujar_venta(venta) {
  let cuadro = document.querySelector('#cuadro-principal');
  cuadro.replaceChildren([]);
  let disabled = "";
  let hijosRes = "";
  let hijos = "";
  let pres = "";
  let strings = "";
  let cant;
  for (let producto of venta.productos) {
    if (producto[0] < 2) {
      disabled = 'disabled';
    } else {
      disabled = '';
    }
    strings = formatear_strings(formatear_descripcion(producto[1]))
    hijos += `<article class="articulo" id="${producto[1].id}">
     <section class="descripcion">
        <p> ${strings} </p>
     </section>
     <section class="cantidad">
       <p> cantidad: </p>
        <button class="button restar" ${disabled}>-</button>
        <p class="cantidad-producto"> ${producto[0]}</p>
        <button class="button sumar">+</button>
     </section>
     <section class="monto">
        <p> Precio: ${producto[1].precio_de_venta} </p>
     </section>
     <section>
      <p> ${producto[1].precio_de_venta * producto[0]}
     </section>
     <section id="borrar">
      <button class="button eliminar">Borrar</button>
    </section>
     </article>`;



    hijosRes += `<p>${strings}</p>`
  }
  hijos += `<section id="monto-total"> TOTAL <p>${venta.monto_total}</p></section>`

  cuadro.innerHTML = `<section id="cuadro-venta">${hijos}</section> <section id="vista-resumen-venta">${hijosRes}</section>`;
  for (let boton of document.querySelectorAll('.sumar')) {
    boton.addEventListener('click', (e) => { sumarProducto(e) });
  }
  for (let boton of document.querySelectorAll('.restar')) {
    boton.addEventListener('click', (e) => { restarProducto(e) });
  }
  for (let boton of document.querySelectorAll('.eliminar')) {
    boton.addEventListener('click', (e) => {
      eliminarProducto(e)
    });
  }
}


async function get_venta_actual() {
  let res = await invoke("get_venta_actual", { pos: posicionVenta });
  let ret = await res;
  // console.log(ret)
  return ret;
}

async function agregarProdVentaAct(id) {
  await invoke("agregar_producto_a_venta", { id: "" + id, pos: "" + posicionVenta });
}
async function descontarProdVentaAct(id) {
  await invoke("descontar_producto_de_venta", { id: "" + id, pos: "" + posicionVenta });
}

async function eliminarProdVentaAct(id) {
  await invoke("eliminar_producto_de_venta", { id: "" + id, pos: "" + posicionVenta })
} 
function borrarBusqueda() {
  document.getElementById('input-productos').value = '';
  document.querySelector('#cuadro-principal').replaceChildren([]);
  get_venta_actual().then(venta => dibujar_venta(venta));
  document.getElementById('input-productos').focus();
}
async function get_filtrado(filtro, tipo_filtro, objetivo) {
  let res = await invoke("get_filtrado", { filtro: filtro, tipoFiltro: tipo_filtro });
  let ops = document.getElementById(objetivo);
  let opciones = [];
  let esta = false;
  for (let i = 0; i < res.length; i++) {
    if (filtro.toUpperCase() === res[i].toUpperCase()) {
      esta = true;
    }
    let el = document.createElement('option');
    el.value = res[i];
    opciones.push(el);
  }
  if (!esta) {
    let el = document.createElement('option');
    el.value = filtro;
    opciones.push(el);
  }

  ops.replaceChildren([]);
  for (let i = 0; i < opciones.length; i++) {
    ops.appendChild(opciones[i]);
  }
}
window.addEventListener("DOMContentLoaded", () => {
  borrarBusqueda();
  let id = "tipo_producto";
  let objetivo = "opciones-tipo-producto";
  let id_marca = "marca";
  let objetivo_marca = "opciones-marca";
  document.getElementById(id).addEventListener('input', () => {
    get_filtrado(document.getElementById(id).value, id, objetivo);
  });
  document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key == 13) {
      document.getElementById(id).value = document.getElementById(objetivo).value;
      document.getElementById(id_marca).focus();
    }
  })

  document.getElementById(id_marca).addEventListener('input', () => {
    get_filtrado(document.getElementById(id_marca).value, id_marca, objetivo_marca);
  });
});

async function buscarProducto(filtrado) {
  clearTimeout(timeoutId);
  if (filtrado.length < 5 || isNaN(filtrado)) {
    let objetos = await invoke("get_productos_filtrado", { filtro: filtrado });

    return objetos
  }
}
async function agregarProveedor() {
  let prov = document.querySelector('#input-nombre-proveedor');
  let cont = document.querySelector('#input-contacto-proveedor');
  mensaje1.textContent = await invoke("agregar_proveedor", { proveedor: prov.value, contacto: cont.value });
  prov.value = '';
  cont.value = '';
}
async function agregarProducto() {
  mensaje1.textContent = ("Producto agregado: " + await invoke("agregar_producto", { proveedores: proveedores_producto, codigosProv: codigosProv, codigoDeBarras: cod.value, precioDeVenta: precio_de_venta.value, porcentaje: percent.value, precioDeCosto: precio_de_costo.value, tipoProducto: tpProd.value, marca: mark.value, variedad: variety.value, cantidad: amount.value, presentacion: pres.value }));
  proveedores_producto = [];
  codigosProv = [];
}

async function get_configs() {
  return await invoke("get_configs");
}

async function set_configs(configs) {
  await invoke("set_configs", { configs: configs })
}

window.addEventListener("DOMContentLoaded", () => {

  document.getElementById("menu-button").onclick = function () {
    document.getElementById("barra-de-opciones").classList.toggle('visible');
  };
  document.getElementById("agregar-producto-mostrar").onclick = function () {
    let elemento = document.getElementsByClassName("main-screen");
    for (let i = 0; i < elemento.length; i++) {
      elemento[i].style.display = "none"
    }
    document.getElementById("agregar-producto-container").style.display = "inline-flex";
    document.getElementById("barra-de-opciones").classList.remove('visible');
  }
  document.getElementById("cerrar-agregar-producto").onclick = function () {
    document.getElementById("agregar-producto-container").style.display = "none";
    document.querySelector('#cuadro-principal').style.display = 'grid';
  }


  document.getElementById("cambiar-configs-mostrar").onclick = function () {
    let elemento = document.getElementsByClassName("main-screen");
    for (let i = 0; i < elemento.length; i++) {
      elemento[i].style.display = "none"
    }
    document.getElementById("cambiar-configs-container").style.display = "inline-flex";
    document.getElementById("barra-de-opciones").classList.remove('visible');

    document.querySelector('#input-politica-redondeo').value = configs.politica_redondeo;
    let inputFormatoProducto = document.querySelector('#input-formato-producto')
    inputFormatoProducto.innerHTML = '';
    inputFormatoProducto.innerHTML += `<option value="Tmv">Tipo - Marca - Variedad</option>
      <option value="Mtv">Marca - Tipo - Variedad</option>`
    document.querySelector('#input-modo-mayus').innerHTML = '';
    switch (configs.modo_mayus) {
      case "Upper": {
        document.querySelector('#input-modo-mayus').innerHTML += `
          <option value="Upper" >MAYÚSCULAS</option>
          <option value="Camel" >Pimera Letra Mayúscula</option>
          <option value="Lower" >minúsculas</option>
          `;
        break;
      }
      case "Camel": {
        document.querySelector('#input-modo-mayus').innerHTML += `
          <option value="Camel" >Pimera Letra Mayúscula</option>
          <option value="Upper" >MAYÚSCULAS</option>
          <option value="Lower" >minúsculas</option>
          `;
        break;
      }
      case "Lower": {
        document.querySelector('#input-modo-mayus').innerHTML += `
          <option value="Lower" >minúsculas</option>
          <option value="Camel" >Pimera Letra Mayúscula</option>
          <option value="Upper" >MAYÚSCULAS</option>
          `;
        break;
      }
    }
    document.querySelector('#input-cantidad-productos').value = configs.cantidad_productos;


  }
  document.getElementById("cerrar-cambiar-configs").onclick = function () {
    document.getElementById("cambiar-configs-container").style.display = "none";
    document.querySelector('#cuadro-principal').style.display = 'grid';
  }

  document.querySelector('#cambiar-configs-submit').addEventListener('submit', (e) => {
    e.preventDefault();
    let configs = {
      "politica_redondeo": parseFloat(e.target.children[1].value),
      "formato_producto": "" + e.target.children[3].value,
      "modo_mayus": "" + e.target.children[5].value,
      "cantidad_productos": e.target.children[7].value
    }
    console.log(configs)
    set_configs(configs)
  })


  document.getElementById("agregar-proveedor-mostrar").onclick = function () {
    let elemento = document.getElementsByClassName("main-screen");
    for (let i = 0; i < elemento.length; i++) {
      elemento[i].style.display = "none"
    }
    document.getElementById("agregar-proveedor-container").style.display = "inline-flex";
    document.getElementById("barra-de-opciones").classList.remove('visible');
  }
  document.getElementById("cerrar-agregar-proveedor").onclick = function () {
    document.getElementById("agregar-proveedor-container").style.display = "none";
    document.querySelector('#cuadro-principal').style.display = 'grid';
  }

});




window.addEventListener("DOMContentLoaded", () => {

  document.querySelector('#precio_de_costo').addEventListener('input', () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      if (document.querySelector('#precio_de_costo').value != '') {
        let percent = document.querySelector('#porcentaje').value;
        let sale = document.querySelector('#precio_de_costo').value;
        document.querySelector('#precio_de_venta').value = parseFloat(sale) * (1 + (parseFloat(percent)) / 100)
      }
    }, 2000);


  });
});

window.addEventListener("DOMContentLoaded", () => {
  document.querySelector('#porcentaje').addEventListener('input', () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      if (document.querySelector('#porcentaje').value != '') {
        let percent = document.querySelector('#porcentaje').value;
        let sale = document.querySelector('#precio_de_costo').value;
        if (sale != 0) {
          document.querySelector('#precio_de_venta').value = parseFloat(sale) * (1 + (parseFloat(percent)) / 100)
        }
      }
    }, 500);
  });
});

window.addEventListener("DOMContentLoaded", () => {
  document.querySelector('#precio_de_venta').addEventListener('input', () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      if (document.querySelector('#precio_de_venta').value != '') {
        let costo = document.querySelector('#precio_de_costo');
        let venta = document.querySelector('#precio_de_venta');
        if (costo.value != '') {
          let floatventa = parseFloat(venta.value);
          let floatcosto = parseFloat(costo.value);
          document.querySelector('#porcentaje').value = ((floatventa / floatcosto) * 100.0) - 100.0;
        } else {
          document.querySelector('#precio_de_costo').value = ((100 + parseFloat(document.querySelector('#porcentaje').value) / 100) * parseFloat(venta.value));
        }
      }
    }, 500);
  });
});
window.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener('click', function (e) {
    let ids = [];
    ids.push(e.target);
    ids.push(e.target.parentNode);
    ids.push(e.target.parentNode.parentNode);
    let barra = document.querySelector('#barra-de-opciones');
    let esId = false;
    for (const id of ids) {
      if (id.id == 'menu-image' || id.id == 'menu-button') {
        esId = true;
      }
    }
    if ((!esId && !barra.classList.contains('visible'))) {
      barra.classList.remove('visible');
      barra.classList.remove('para-hamburguesa');
    }


  });
})



window.addEventListener("DOMContentLoaded", () => {
  tpProd = document.querySelector('#tipo_producto');
  mark = document.querySelector('#marca');
  variety = document.querySelector('#variedad');
  amount = document.querySelector('#cantidad');
  pres = document.querySelector('#presentacion');
  cod = document.querySelector('#codigo_de_barras');
  precio_de_venta = document.querySelector('#precio_de_venta');
  percent = document.querySelector('#porcentaje');
  precio_de_costo = document.querySelector('#precio_de_costo');
  document.querySelector('#agregar-producto-submit').addEventListener("submit", (e) => {
    e.preventDefault();
    agregarProducto();
  })
  document.querySelector('#agregar-proveedor-submit').addEventListener("submit", (e) => {
    e.preventDefault();
    agregarProveedor();
  })
})

window.addEventListener("DOMContentLoaded", async () => {
  let provs = await invoke("get_proveedores")
  proveedores = provs;
  console.log(provs);
  for (let i = 0; i < provs.length; i++) {
    let option = document.createElement("option");
    option.text = provs[i];
    option.value = provs[i];
    document.querySelector('#proveedor').appendChild(option);
  }
})

//Agrega relacion
window.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#agregar-proveedor-a-producto").addEventListener("submit", (e) => {
    e.preventDefault();
    let res = document.querySelector('#proveedor').value;
    let cod = document.querySelector('#codigo_prov').value;
    if (!proveedores_producto.includes(res)) {
      proveedores_producto.push(res);
      codigosProv.push(cod);
    }
    console.log(proveedores_producto + " y " + codigosProv + "|");
  });
})



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}