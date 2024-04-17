import { useState } from "react";
import "./ProductoBusqueda.css";
import { invoke } from "@tauri-apps/api/tauri";
async function get_descripcion_valuable(prod, conf) {
    return await invoke("get_descripcion_valuable", { "prod": prod, "conf": conf });
}
function ProductoBusqueda({conf,producto,focused,setFocuseado,index}){

    const [desc,setDesc] = useState("");
    get_descripcion_valuable(producto,conf).then(descripcion=>setDesc(descripcion));
    let valor;
    let i;
    if (Object.keys(producto)=='Prod'){
        valor=producto.Prod[1].precio_de_venta
        i=producto.Prod[1].id
    }else if (Object.keys(producto)=='Rub'){
        valor=producto.Rub[1].monto
        i=producto.Rub[1].id
    }else if (Object.keys(producto)=='Pes'){
        valor=producto.Pes[1].precio_peso
        i=producto.Pes[1].id
    }
    return(<tr tabIndex="2" id={i} onClick={()=>{console.log(index);setFocuseado(index)}} onDoubleClick={()=>{console.log(producto)}} className={focused}>
        <td className={conf.modo_mayus}>{desc}</td>
        <td>${valor}</td>
    </tr>)
}


export default ProductoBusqueda;