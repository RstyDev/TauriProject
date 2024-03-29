const { invoke } = window.__TAURI__.tauri;
let rango;
let nombre;
let dni;
let cred;
let limite;
document.addEventListener('keydown',(e)=>{
    if (e.keyCode==27){
        close_window();
    }
});
get_rango().then(r=>{
    rango=r;
    let form=document.getElementsByClassName('add-form')[0];
    if (rango!='Admin'){
        form.innerHTML+='<input type="submit" value="Guardar">'
        nombre=document.getElementById('nombre');
        dni=document.getElementById('dni');
    }else{
        form.innerHTML+=`<input type="checkbox" name="credito" id="cred" placeholder="Venta a crédito">
        <input type="text" name="limite" id="limite" placeholder="Limite de rédito">
        <input type="submit" value="Guardar">`
        nombre=document.getElementById('nombre');
        dni=document.getElementById('dni');
        limite=document.getElementById('limite');
        cred=document.getElementById('cred');
        cred.addEventListener('change',()=>{
            if (!cred.checked){
                limite.disabled='disabled'
            }else{
                limite.removeAttribute('disabled');
            }
        })
    }
})
async function get_rango(){
    return await invoke("get_rango");
}
async function close_window() {
    return await invoke("close_window");
}
document.getElementsByClassName('add-form')[0].addEventListener('submit',(e)=>{
    e.preventDefault();
    console.log(document.getElementById('dni').value);
    let credito;
    let limit;
    if (rango=='Admin'){
        credito=cred.checked;
        limit=limite.value;
    }else{
        credito=false;
    }
    try{
        agregar_cliente(nombre.value,dni.value,credito,limit).then(cli=>{
            console.log(cli)
        });
    }catch (error){
        console.error(error);
    }
})
async function agregar_cliente(nombre,dni,credito,limite){
    return await invoke("agregar_cliente", { nombre:nombre, dni:dni, credito:credito, limite:limite})
}